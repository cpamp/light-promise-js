"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $states = {
    pending: 0,
    resolved: 1,
    rejected: 2
};
var $Promise = (function () {
    function $Promise(callback) {
        var _this = this;
        this.state = $states.pending;
        callback(function (data) { _this.resolve(data); }, function (data) { _this.reject(data); });
    }
    $Promise.prototype.resolve = function (data) {
        var _this = this;
        try {
            if (data && typeof data.then === 'function') {
                data.then(function (data) { _this.resolve(data); }, function (data) { _this.reject(data); });
                return;
            }
            this.data = data;
            this.state = $states.resolved;
            if (this.deferred) {
                this.handle(this.deferred);
            }
        }
        catch (e) {
            this.reject(e);
        }
    };
    $Promise.prototype.reject = function (data) {
        this.data = data;
        this.state = $states.rejected;
        if (this.deferred) {
            this.handle(this.deferred);
        }
    };
    $Promise.prototype.handle = function (deferred) {
        var _this = this;
        if (this.state === $states.pending) {
            this.deferred = deferred;
            return;
        }
        setTimeout(function () {
            var callback;
            if (_this.state === $states.resolved) {
                callback = deferred.$$resolved;
            }
            else if (_this.state === $states.rejected) {
                callback = deferred.$$rejected;
            }
            if (!callback) {
                if (_this.state === $states.resolved) {
                    deferred.$$resolve(_this.data);
                }
                else if (_this.state === $states.rejected) {
                    deferred.$$reject(_this.data);
                }
            }
            else {
                try {
                    var r = callback(_this.data);
                    deferred.$$resolve(r);
                }
                catch (e) {
                    deferred.$$reject(e);
                }
            }
        });
    };
    $Promise.prototype.then = function (resolved, rejected) {
        var _this = this;
        return new $Promise(function (resolve, reject) {
            _this.handle({
                $$resolved: resolved,
                $$rejected: rejected,
                $$resolve: resolve,
                $$reject: reject
            });
        });
    };
    $Promise.prototype.done = function (resolved, rejected) {
        this.handle({
            $$resolved: resolved,
            $$rejected: rejected,
            $$resolve: this.resolve,
            $$reject: this.reject
        });
    };
    return $Promise;
}());
exports.$Promise = $Promise;
