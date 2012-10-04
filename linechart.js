function CreateLineChart(id,width,height,opt){
	var paper = Raphael(id,width,height);
	if (!opt.xlabelw) opt.xlabelw = 50;
	if (!opt.ylabelw) opt.ylabelw = 40;
	if (!opt.xgridw) opt.xgridw = 80;
	if (!opt.ygridw) opt.ygridw = 80;
	if (!opt.marginTop) opt.marginTop = 25;
	if (!opt.marginRight) opt.marginRight = 20;
	if (!opt.markerSize) opt.markerSize = 4;
	if (!opt.lineSize) opt.lineSize = 2;
	if (!opt.legendHeight) opt.legendHeight = 20;

	if (opt.minGap < 0) opt.minGap = 0;
	var minGap = opt.minGap;
	
	var W = width - opt.xlabelw - opt.marginRight,
		H = height - opt.ylabelw - opt.marginTop;
	
	var marker = {
		'o':function (x,y,s,c){
			if (!s) s = opt.markerSize;
			var p = paper.circle(x,y,s)
			.attr('stroke-width',opt.lineSize)
//			.attr('fill-opacity',100)
			.attr('fill',opt.backgroundColor);
			if (c) p.attr('stroke',c);
		},
		'v':function (x,y,s,c){
			if (!s) s = opt.markerSize;
			var h = s;
			y += h/4;
			var p = paper.path(
				'M' + (x) + ' ' + (y+h) + 
				'L' + (x+h) + ' ' + (y-h) + 
				'L' + (x-h) + ' ' + (y-h) + 
				'L' + (x) + ' ' + (y+h)
			).attr('stroke-width',opt.lineSize)
			.attr('fill',opt.backgroundColor);
			if (c) p.attr('stroke',c);
		},
		'^':function (x,y,s,c){
			if (!s) s = opt.markerSize;
			var h = s;
			y -= h/4;
			var p = paper.path(
				'M' + (x) + ' ' + (y-h) + 
				'L' + (x+h) + ' ' + (y+h) + 
				'L' + (x-h) + ' ' + (y+h) + 
				'L' + (x) + ' ' + (y-h)
			).attr('stroke-width',opt.lineSize)
			.attr('fill',opt.backgroundColor);
			if (c) p.attr('stroke',c);
		},
		'x':function (x,y,s,c){
			if (!s) s = opt.markerSize;
			var h = s;
			var p = paper.path(
				'M' + (x-h) + ' ' + (y-h) + 
				'L' + (x+h) + ' ' + (y+h) + 
				'M' + (x-h) + ' ' + (y+h) + 
				'L' + (x+h) + ' ' + (y-h)
			).attr('stroke-width',opt.lineSize)
			.attr('fill',opt.backgroundColor);
			if (c) p.attr('stroke',c);
		},
		's':function (x,y,s,c){
			if (!s) s = opt.markerSize;
			var h = s;
			var p = paper.path(
				'M' + (x-h) + ' ' + (y-h) + 
				'L' + (x-h) + ' ' + (y+h) + 
				'L' + (x+h) + ' ' + (y+h) + 
				'L' + (x+h) + ' ' + (y-h) + 
				'L' + (x-h) + ' ' + (y-h)
			).attr('stroke-width',opt.lineSize)
			.attr('fill',opt.backgroundColor);
			if (c) p.attr('stroke',c);
		}
	};
	
	var markers = [];
	for (var m in marker)
		if (marker.hasOwnProperty(m))
			markers.push(m);

	var colors = [
		"#FF0000", "#157DEC", "#04B404", "#FF8040", "#8E35EF", "#8A4B08", 
		"#0000FF", "#00FF00", "#C35617", "#6698FF", "#FF8040", "#408080", 
		"#736AFF", "#FF00FF", "#808000", "#00FFFF", "#DD66DD", "#D7DF01" ];

	opt.legendi = {};
	if (!opt.legends) opt.legends = [];
	for (var i=0; i<opt.legends.length; i++){
		opt.legendi[opt.legends[i]] = i;	
	}	
	

	var xmax=0, xmin=0;
	var ymax=0, ymin=0;
	var logx, logy;
	var use_lines;
	var legend_pos;
	var cumulative;
	
	function get_marker(legend){
		var m = opt.legendi[legend] % markers.length;
		return marker[markers[m]];
	}
	
	function get_color(legend){
		var m = opt.legendi[legend] % colors.length;
		return colors[m];
	}

	function draw_line(series){
		var data = series.data;
		var color = get_color(series.legend);
		var arr = [], px=-1e100, py=-1e100;
		var xs = W / (logx? (log2(xmax) - log2(xmin)) : (xmax - xmin));
		var ys = H / (logy? (log2(ymax) - log2(ymin)) : (ymax - ymin));
		var ps = '';
		if (use_lines){
			for (var i=0; i<data.length; i++){
				var xp = logx? (log2(data[i][0]) - log2(xmin)) : (data[i][0] - xmin);
				var yp = logy? (log2(data[i][1]) - log2(ymin)) : (data[i][1] - ymin);
				var x = opt.xlabelw + xp * xs, y = height - (opt.ylabelw + yp * ys);
				if (i+1 < data.length && minGap){
					var dx = x - px, dy = y - py;
					if (dx*dx + dy*dy < minGap*minGap){ continue; }
				}
				if (x < opt.xlabelw){ continue; }
//				if (y < opt.ylabelw) continue;
				
				ps += ((!ps)?"M":"L") + x + " " + y;
				px = x; py = y;
			}
		}
		// console.log(ps);
		paper.path(ps).attr('stroke-width',opt.lineSize).attr('stroke',color);
		for (var i=0,px=py=-1e100; i<data.length; i++){
			var xp = logx? (log2(data[i][0]) - log2(xmin)) : (data[i][0] - xmin);
			var yp = logy? (log2(data[i][1]) - log2(ymin)) : (data[i][1] - ymin);
			var x = opt.xlabelw + xp * xs, y = height - (opt.ylabelw + yp * ys);
			if (i+1 < data.length && minGap){
				var dx = x - px, dy = y - py;
				if (dx*dx + dy*dy < minGap*minGap) continue;
			}
			if (x < opt.xlabelw) continue;
			get_marker(series.legend)(x,y,opt.markerSize,color);
			px = x; py = y;
		}
	}

	function draw_axes(){
//		var c = paper.rect(0, 0, width, height);
//		c.attr('stroke',"#666");
		if (opt.backgroundColor){
			var c = paper.rect(opt.xlabelw, opt.marginTop, W, H);
			c.attr('fill',opt.backgroundColor);
			c.attr('stroke',"#000");
		} else {
			var c = paper.rect(opt.xlabelw, opt.marginTop, W, H);
			c.attr('stroke',"#000");
		}
	}

	function calc_10pow(w,gw,mn,mx){	// width, grid_width
		var n = Math.ceil(w / gw);
		var f = 1e-6; while (mx - mn > n * f * 10) f *= 10;
		var g = f; while (mx - mn > n * (g + f)) g += f;
		return g;
	}
	
	function dec10(x){
		var y = x - Math.floor(x);
		if (y > 0.000001) return Math.floor(x) + '.' + Math.floor(y*10);
		return Math.floor(x);
	}

	function isInt(n) {
		return n % 1 == 0;
	}
	
	function format10(x){
		if (x > 1000000000) return dec10(x/1000000000) + 'B';
		if (x > 1000000) return dec10(x/1000000) + 'M';
		if (x > 1000) return dec10(x/1000) + 'K';
		if (!isInt(x)){
			x = ''+(parseFloat(x)+1e-9);
			while (x.length > 7) x = x.substring(0,7);
			x = parseFloat(x);
		}
		return x;
	}
	
	function get_ticks(g,mn,mx){
		var t = [], v = mn;
//		if (mn < g) t.push([mn, format10(mn)]);
//		if (mn < g) t.push([mn, 0]);
		while (v <= mx){
			t.push([v, format10(v)]);
			v += g;
		}
//		t.push([mx, format10(mx)]);
		// console.log(g + ' ' + mn + ' ' + mx + ' ' + JSON.stringify(t));
		return t;
	}

	function get_ticks_old(g,mn,mx){
		var t = [], v = g;
//		if (mn < g) t.push([mn, format10(mn)]);
//		if (mn < g) t.push([mn, 0]);
		while (v <= mx){
			if (v >= mn) t.push([v, format10(v)]);
			v += g;
		}
//		t.push([mx, format10(mx)]);
		// console.log(g + ' ' + mn + ' ' + mx + ' ' + JSON.stringify(t));
		return t;
	}

	function trunc_dec(x,n){
		var i = x.indexOf('.');
		if (i!=-1 && x.length - i > n) return x.substring(0,i+n);
		return x;
	}

	function get_log_ticks(mn,mx){
		var t = [[1, "1"]];

		for (var v=0.5, p=-1; v*2 > mn && p>-20; v/=2, p--)
			t.unshift([v, v>0.001? trunc_dec(""+v,4) : ("2^"+p)]);
			
		for (var v=2, p=1; v < 2*mx; v*=2, p++)
			t.push([v, v<1024? (""+v) : ("2^"+p)]);

		while (t[t.length-1][0] > mx) t.pop();
		while (t[0] && t[0][0] < mn) t.shift();

//		alert(mn + ' ' + mx + ' ' + JSON.stringify(t));
		return t;
	}

	function draw_grids(){
		var xt = logx? get_log_ticks(xmin,xmax) : get_ticks(calc_10pow(W, opt.xgridw, xmin, xmax), xmin, xmax);
		var yt = logy? get_log_ticks(ymin,ymax) : get_ticks(calc_10pow(H, opt.ygridw, ymin, ymax), ymin, ymax);
		var xs = W / (logx? (log2(xmax) - log2(xmin)) : (xmax - xmin));
		var ys = H / (logy? (log2(ymax) - log2(ymin)) : (ymax - ymin));
		for (var i=0; i<xt.length; i++){
			var xp = logx? (log2(xt[i][0]) - log2(xmin)) : (xt[i][0] - xmin);
			var x = opt.xlabelw + xp * xs;
			paper.path(
				"M" + x + " " + (height-(opt.ylabelw)) +
				"L" + x + " " + (height-(opt.ylabelw+H))).attr('stroke-width',0.2);
			var txt = paper.text(x, height-opt.ylabelw+14, xt[i][1]);
			txt.attr('align','center');
			txt.attr('font',"12px sans-serif");
		}
		var ynticks = Math.ceil(H / opt.ygridw);
		for (var i=0; i<yt.length; i++){
			var yp = logy? (log2(yt[i][0]) - log2(ymin)) : (yt[i][0] - ymin);
			var y = height - (opt.ylabelw + yp * ys);
			paper.path(
				"M" + (opt.xlabelw) + " " + y +
				"L" + (opt.xlabelw + W) + " " + y).attr('stroke-width',0.2);
			var txt = paper.text(opt.xlabelw - 7, y, yt[i][1]);
			txt.attr('text-anchor','end');
			txt.attr('font',"12px sans-serif");
		}
	}

	function add_legend(legend){
		if (typeof opt.legendi[legend] == 'undefined'){
			opt.legendi[legend] = opt.legends.length;
			opt.legends.push(legend);
		}
	}
	
	function draw_xytitles(xlabel, ylabel, title){
		var bx = opt.xlabelw+W/2, by = height - 8;
		var txt = paper.text(bx, by, xlabel);
		txt.attr('text-anchor','middle');
		txt.attr('font',"14px Arial");

		txt = paper.text(15, opt.marginTop + H/2, ylabel);
		txt.transform("r-90");
		txt.attr('text-anchor','middle');
		txt.attr('font',"14px Arial");

		if (title){
			txt = paper.text(bx, 8, title);
			txt.attr('text-anchor','middle');
			txt.attr('font',"14px Arial");
		}
	}

	function draw_legends(series){
		var maxlen = 0, seriesLen = 0;
		$.each(series, function(k,v){ seriesLen++; maxlen = Math.max(maxlen, v.legend.length); });

		var w = maxlen * 8 + 60;
		var h = seriesLen * opt.legendHeight;
		var bx = opt.xlabelw + W - w - 10;
		var by = opt.marginTop + 10;
		switch (legend_pos){
			case 'nw' : bx = opt.xlabelw + 10; break;
			case 'sw' : bx = opt.xlabelw + 10; by = opt.marginTop + H - h - 20; break;
			case 'se' : by = opt.marginTop + H - h - 20; break;
		}
		var c = paper.rect(bx, by, w, h + 10);
		c.attr('fill',"#fff");
		c.attr('fill-opacity',0.7);
		c.attr('stroke',"#000");
		c.attr('stroke-width',0.2);
		by += 5;
		$.each(series, function(i,ser){
			var color = get_color(ser.legend);
			var p = paper.path('M' + (bx+10) + ' ' + (by+opt.legendHeight/2) + 'L' + (bx+40) + ' ' + (by+opt.legendHeight/2));
			p.attr('stroke',color);
			p.attr('stroke-width',opt.lineSize);
			var mi = opt.legendi[ser.legend] % markers.length;
			marker[markers[mi]](bx+25, by+opt.legendHeight/2,opt.markerSize, color);
			var txt = paper.text(bx + 45, by+opt.legendHeight/2, ser.legend);
			txt.attr('text-anchor','start');
			txt.attr('font',"14px courier new");
			by += opt.legendHeight;
		});
	}

	function preprocess(series,dopt){
		var nseries = {};
		xmin = ymin = 1e100;
		xmax = ymax = -1e100;
		$.each(series, function(i,ser){
			var data = ser.data, ndata = [];
			var y = 0;
			for (var j=0; j<data.length; j++){
				y = (cumulative? y : 0) + parseFloat(data[j][1]);
				if (logy && y==0) y = 1e-6;
				xmin = Math.min(xmin, data[j][0]);
				ymin = Math.min(ymin, y);
				xmax = Math.max(xmax, data[j][0]);
				ymax = Math.max(ymax, y);
				ndata.push([data[j][0], y]);
			}
			nseries[i] = {legend: ser.legend, data: ndata};
		});
		if (dopt.xmin) xmin = Math.max(xmin, dopt.xmin);
		if (dopt.ymin) ymin = Math.max(ymin, dopt.ymin);
		if (dopt.xmax) xmax = Math.min(xmax, dopt.xmax);
		if (dopt.ymax) ymax = Math.min(ymax, dopt.ymax);
		
		if (dopt.minx != undefined) xmin = dopt.minx;
		if (dopt.miny != undefined) ymin = dopt.miny;
		if (dopt.maxx != undefined) xmax = dopt.maxx;
		if (dopt.maxy != undefined) ymax = dopt.maxy;
		
		return nseries;
	}

	function log2(x){ return Math.log(x) / Math.LN2; }
	
	function draw_series(series,dopt){
		paper.clear();
//		alert(JSON.stringify(dopt));
		cumulative = dopt.cumulative;
		use_lines = dopt.use_lines;
		legend_pos = dopt.legend_pos;
		logx = logy = false;
		switch (dopt.plot){
			case 'loglog': logx = logy = true; break;
			case 'semilogx': logx = true; break;
			case 'semilogy': logy = true; break;
		}
		series = preprocess(series,dopt);		
		draw_axes();
		draw_grids();
		$.each(series, function(i,ser){ add_legend(ser.legend); });
		$.each(series, function(i,ser){ draw_line(ser); });
		if (legend_pos) draw_legends(series);
		draw_xytitles(dopt.xlabel, dopt.ylabel, dopt.title);
	}
	
	return {
		draw:draw_series
	};
}