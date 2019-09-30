Object.defineProperty(StructureContainer.prototype, 'isFull', {
    get: function() {
        if (!this._isFull) {
            this._isFull = _.sum(this.store) === this.storeCapacity;
        }
        return this._isFull;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureContainer.prototype, 'contents', {
    get: function() {
        var contents = [];
        for (let info in this.store) {
            contents.push(info);
        }
        return contents;
    }
})