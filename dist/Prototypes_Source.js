Source.prototype.findContainerSpot =
    function() {
        if (this.checkSpot(this.x+1, this.y)) {
            return {x: this.x+1, y: this.y};
        }
        if (this.checkSpot(this.x, this.y+1)) {
            return {x: this.x, y: this.y+1};
        }
        if (this.checkSpot(this.x-1, this.y)) {
            return {x: this.x-1, y: this.y};
        }
        if (this.checkSpot(this.x, this.y-1)) {
            return {x: this.x, y: this.y-1};
        }
        if (this.checkSpot(this.x+1, this.y+1)) {
            return {x: this.x+1, y: this.y+1};
        }
        if (this.checkSpot(this.x-1, this.y+1)) {
            return {x: this.x-1, y: this.y+1};
        }
        if (this.checkSpot(this.x-1, this.y-1)) {
            return {x: this.x-1, y: this.y-1};
        }
        if (this.checkSpot(this.x+1, this.y-1)) {
            return {x: this.x+1, y: this.y-1};
        }
        return undefined;s
    }

Source.prototype.checkSpot =
    function(x,y) {
        var spot = this.room.lookAt(x, y);
        for (var s of spot) {
            if (s.type != "creep") {
                return false;
            }
        }
        return true;
    }   