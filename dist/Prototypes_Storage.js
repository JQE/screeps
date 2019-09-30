Object.defineProperty(StructureStorage.prototype, 'isFull', {
    get: function() {
        if (!this._isFull) {
            this._isFull = _.sum(this.store) === this.storeCapacity;
        }
        return this._isFull;
    },
    enumerable: false,
    configurable: true
});