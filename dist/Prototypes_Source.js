Source.prototype.findContainerSpot =
    function() {
        [this.pos.x-1, this.pos.x, this.pos.x+1].forEach(x => {
            [this.pos.y-1, this.pos.y, this.pos.y+1].forEach(y => {
                var info = this.room.lookAt(x,y);
                for (let s of info) {
                    if (s.type != "structure" && (s.type != "terrain" || (s.type == "terrain" && s.terrain == "swamp"))) {
                        return { x: x, y: y};
                    }
                }
            });
        });
    }