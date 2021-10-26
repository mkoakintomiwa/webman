class LineManager{
    constructor(string){
        this.string = string;
        this.value = string;
    }
    
    object(){ 
        return this.value.split('\n'); 
    }


    remove(stringToBeRemoved){
        var _object = this.object();
        _object.forEach((value,index) => {
            if (value.trim()===stringToBeRemoved){
                delete _object[index];
            }
        });
        this.value = _object.join('\n');
        return this;
    }


    removeAll(stringToBeRemoved){
        var _object = this.object();
        _object.forEach((value,index) => {
            if (value.trim().indexOf(stringToBeRemoved)!=-1){
                delete _object[index];
            }
        });
        this.value = _object.join('\n');
        return this;
    }

    fetch(lineNumber){
        var _object = this.object();
        for (let i=0;i<_object.length;i++){
            if (i+1===lineNumber){
                return _object[i];
            }
        }
        return null;
    }


    edit(content,lineNumber){
        var _object = this.object();
        _object[lineNumber-1] = content;
        this.value = _object.join('\n');
        return this;
    }


    add(content){
        var _object = this.object();
        _object[_object.length] = content;
        this.value = _object.join('\n');
        return this;
    }

    /**
     * Search content and returns the line number
     * @param {string} needle
	 * @returns {number?}
     */
    search(needle){
        var _object = this.object();

		for (let [index,value] of _object.entries()){
			if (value.trim()===needle){
                return index+1
            }
		}

        this.value = _object.join('\n');
        return null;
    }

    /**
     * 
     * @returns {string}
     */
    content(){
        return this.value;
    }
}

module.exports = LineManager;