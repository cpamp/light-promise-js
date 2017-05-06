var $states = {
    pending:    0
    ,resolved:  1
    ,rejected:  2
};

export interface IResultCallback {
    (result: any)
}

export interface ICallback {
    (resolve: IResultCallback, reject: IResultCallback)
}

export class $Promise {
    private data;
    private deferred;
    private state = $states.pending;

    constructor(callback: ICallback) {
        callback((data) => { this.resolve(data); },
                 (data) => { this.reject(data); });
    }

    resolve(data: any) {
        try {
            if(data && typeof data.then === 'function') {
                data.then((data) => { this.resolve(data); },
                          (data) => { this.reject(data); });
                return;
            }

            this.data = data;
            this.state = $states.resolved;
            if(this.deferred) {
                this.handle(this.deferred);
            }
        } catch(e) {
            this.reject(e);
        }
    }

    reject(data: any) {
        this.data = data;
        this.state = $states.rejected;
        if(this.deferred) {
            this.handle(this.deferred);
        }
    }

    handle(deferred: any) {
        if(this.state === $states.pending) {
            this.deferred = deferred;
            return;
        }

        setTimeout(() => {
            var callback;
            if(this.state === $states.resolved) {
                callback = deferred.$$resolved;
            } else if(this.state === $states.rejected) {
                callback = deferred.$$rejected;
            }

            if(!callback) {
                if(this.state === $states.resolved) {
                    deferred.$$resolve(this.data);
                } else if(this.state === $states.rejected) {
                    deferred.$$reject(this.data);
                }
            } else {
                try {
                    var r = callback(this.data);
                    deferred.$$resolve(r);
                } catch(e) {
                    deferred.$$reject(e);
                }
            }
        });
    }

    then(resolved: IResultCallback, rejected: IResultCallback) {
        return new $Promise((resolve, reject) => {
            this.handle({
                $$resolved: resolved
                ,$$rejected: rejected
                ,$$resolve: resolve
                ,$$reject: reject
            });
        });
    }

    done(resolved: IResultCallback, rejected: IResultCallback) {
        this.handle({
            $$resolved: resolved
            ,$$rejected: rejected
            ,$$resolve: this.resolve
            ,$$reject: this.reject
        });
    }
}