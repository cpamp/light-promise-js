enum State {
    pending =    0,
    resolved =   1,
    rejected =   2
};

interface IDeferred {
    resolved(data:any),
    rejected(data:any),
    resolve(data:any),
    reject(data:any),
    caught: boolean
}

export interface IResultCallback {
    (result: any)
}

export interface ICallback {
    (resolve: IResultCallback, reject: IResultCallback)
}

export class $Promise {
    private value: any;
    private deferred: IDeferred;
    private state: State = State.pending;

    constructor(callback: ICallback) {
        try {
            if (typeof callback === 'function') callback(data => this.resolve(data), data => this.reject(data));
            else this.resolve();
        } catch(e) {
            this.value = e;
            this.reject(e);
        }
    }

    resolve(data?: any) {
        if (this.state !== State.pending) return;
        try {
            if(data && typeof data.then === 'function') {
                data.then(d => this.resolve(d), d => this.reject(d));
                return;
            }

            this.value = data;
            this.state = State.resolved;
            if(this.deferred) {
                this.handle(this.deferred);
            }
        } catch(e) {
            this.reject(e);
        }
    }

    reject(data?: any) {
        if (this.state !== State.pending) return;

        this.value = data;
        this.state = State.rejected;
        if(this.deferred) {
            this.handle(this.deferred);
        }
    }

    private handle(deferred: IDeferred) {
        if(this.state === State.pending) {
            this.deferred = deferred;
            return;
        }

        setTimeout(() => {
            if(this.state === State.resolved && typeof deferred.resolved === 'function') {
                try {
                    var r = deferred.resolved(this.value);
                    deferred.resolve(r || this.value);
                } catch(e) {
                    deferred.reject(e);
                }
            } else if(this.state === State.rejected && typeof deferred.rejected === 'function') {
                try {
                    var r = deferred.rejected(this.value);
                    if (deferred.caught === true) deferred.resolve(r || this.value);
                    else deferred.reject(r || this.value)
                } catch(e) {
                    deferred.reject(e);
                }
            } else {
                if(this.state === State.resolved) {
                    deferred.resolve(this.value);
                } else if(this.state === State.rejected) {
                    deferred.reject(this.value);
                }
            }
        });
    }

    then(resolved?: IResultCallback, rejected?: IResultCallback) {
        return new $Promise((resolve, reject) => {
            this.handle({
                resolved: resolved,
                rejected: rejected,
                resolve: resolve,
                reject: reject,
                caught: false
            });
        });;
    }

    catch(rejected: IResultCallback) {
        return new $Promise((resolve, reject) => {
            this.handle({
                resolved: null,
                rejected: rejected,
                resolve: resolve,
                reject: reject,
                caught: true
            });
        })
    }
}