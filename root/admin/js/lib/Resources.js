// JavaScript Document
(function(){
	
	
	function Resources(stageName)
	{
		var _p = Resources.prototype = this;
		var _stageName = stageName;
		
		this.loadObjList = [];
		
		this.loadPartList = [];
		this.loadPartDic = {};
		this.queue;
		
		this.load = function(cb)
		{
			this.queue = new createjs.LoadQueue(false);
			this.queue.addEventListener("complete", loadComplete);
			this.queue.addEventListener("error", loadError);
			
			if(this.loadObjList.length == 0)
			{
				loadPart(0, cb);
			}
			else
			{
				this.queue.loadManifest(this.loadObjList);
			}
			
			function loadComplete(evt)
			{
				_p.queue.removeEventListener("complete", loadComplete);
				_p.queue.removeEventListener("error", loadError);
				//console.log("resources load complete");
				
				//if(cb != null) cb.apply();
				
				if(_p.loadPartList.length == 0)
				{
					if(cb != null) cb.apply();
				}
				else
				{
					loadPart(0, cb);
				}
			}
			
			function loadError(evt)
			{
				console.log("resources load error, src: " + evt.item.src);
			}
		};
		
		this.add = function(type, url, id)
		{
			var obj = {};
			obj.src = url;
			obj.id = (id == null) ? url : id;
			if(type == 'parts')
			{
				_p.loadPartList.push(obj);
				_p.loadPartDic[obj.id] = obj;
			}
			else
			{
				_p.loadObjList.push(obj);
			}
			
			return obj;
		};
		
		this.getImage = function(id)
		{
			//if(!_p.loadPartDic[id]) console.log("image id: " + id + " missing");
			return _p.queue.getResult(id);
		};
		
		this.getPart = function(id)
		{
			if(!_p.loadPartDic[id]) console.log("part id: " + id + " is missing");
			return _p.loadPartDic[id].data;
		};
		
		
		function loadPart(index, cb)
		{
			var obj = _p.loadPartList[index];
			
			$.ajax({
				url:obj.src,
				success:function(result){
					obj.data = result;
					toNext();
				},
				error:function(xhr, status, error){
					console.log("resources load error, src: " + obj.src);
					toNext();
				}
			});
			
			function toNext()
			{
			 	index++;
				if(index >= _p.loadPartList.length)
				{
					//console.log("load parts complete");
					if(cb != null) cb.apply();
				}
				else
				{
					loadPart(index, cb);
				}
			}
		}
	}
	
	window.Resources = Resources;
	
}());