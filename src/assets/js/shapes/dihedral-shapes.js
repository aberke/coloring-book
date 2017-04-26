

class DihedralShape extends CyclicShape {
    
    constructor(paper, origin, size, options) {
    	options = options || {};
    	options.withReflection = true;
        super(paper, origin, size, options);
    }


	getSidePathList() {
        var startPointPathPart = ["M", this.origin.X, this.origin.Y];
        
		var linePathList = [
			// add side one of path
			startPointPathPart,
			["L", this.origin.X - this.size/(2*this.N), this.origin.Y + this.size/4],
			["L", this.origin.X, this.origin.Y + this.size/2],
			// add side two of path as symmetric complement to side one
			startPointPathPart,
			["L", this.origin.X + this.size/(this.N + 1), this.origin.Y + this.size/4],
			["L", this.origin.X, this.origin.Y + this.size/2],
		];
		return linePathList;
	}
}
