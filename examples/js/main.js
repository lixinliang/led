seajs.use(['$',
	'arale/switchable/1.0.2/slide',
	'arale/autocomplete/1.3.2/autocomplete',
	'arale/autocomplete/1.3.2/filter'], function ( $, Slide, Autocomplete, Filter ) {
	window.$ = $;
	$(function(){
		new Slide({
            element : '[data-role="slide-console"]',
            classPrefix : null,
            activeTriggerClass : 'is-active',
            autoplay : false,
            effect : 'scrollx'
		}).render();
		var dis = 'is-disable';
		var cvs = $('[data-role=led-content]');
		var log = (function ( msg ) {
			this.append(msg);
			var val = this.height() - this.parent().height();
			this.parent().scrollTop(val > 0 ? val : 0 );
		}).bind($('.ui-log p'));
		var led = new LED({
			width : 980,
			height : 490,
			// pointRadius : 5,
			// pointRadius : 2.5,
			// gap : 13,
			// gap : 9,
			// shiver : false,
			// diffuse : false,
			action : 'YY UED'
			// formatTime : function ( date ) {
			// 	var h = date.getHours();
			// 	var m = date.getMinutes();
			// 	var s = date.getSeconds();
			// 	m = m < 10 ? '0' + m : m;
			// 	s = s < 10 ? '0' + s : s;
			// 	return h + ':' + m + ':' + s
			// },
			// split : ',',
			// command : '$',
			// partition : ':',
			// action : '#rectangle|#circle|#rectangle|||nice|##?a|'
			// action : 'nice,$circle:15,'
			// action : '#countdown 2|||'
			// action : 'A|B|#countdown 2|C|D|'
			// action : '#time|'
			// action : '#icon nice'
		}).on('init', function(){
			log('init successful<br>');
		}).on('action', function ( command ) {
			log(command.current+'<br>');
		}).on('shuffle', function(){
			log('shuffle end<br>');
		});
		window.led=led;
		var ac = new Autocomplete({
			trigger : '.btn-input',
			dataSource : ['#count','#countdown','#rectangle','#circle','#time', '#icon'],
			selectFirst : true,
			filter : function ( data, val) {
				var ret = val.split('|');
				return Filter.startsWith(data, ret.pop())
			}
		}).render().on('indexChanged', function ( current ) {
			if (this.items.length<4||!ac.element.is(':visible')) {
				return
			}
			var parent = this.items.parent().parent();
			var itemHeight = this.items.eq(1).offset().top - this.items.eq(0).offset().top;
			var parentOffset = parent.scrollTop();
			var currentOffset = current*itemHeight;
			if (currentOffset < parentOffset) {
				parent.scrollTop( (current)*itemHeight );
			} else if (currentOffset > (parentOffset + 2*itemHeight)) {
				parent.scrollTop( (current-2)*itemHeight );
			}
		});
		ac.input.setValue = function ( val ) {
			var ret = this.get("element").val().split('|');
			ret.pop();
			ret.push(val);
			this.get("element").val(ret.join('|'));
		};

		var btns = $('.ui-btn').not('.btn-init').not('.btn-destroy').not('.btn-start');
		var btn = $('.btn-start');
		var input = $('.btn-input');
		$('.btn-init').on('click', function(){
			if ($(this).hasClass(dis)) {
				return
			}
			cvs.css('opacity', 1);
			led.init();
			$(this).addClass(dis).siblings().removeClass(dis);
			btns.removeClass(dis);
			input.attr('readonly', false);
		});
		$('.btn-destroy').on('click', function(){
			if ($(this).hasClass(dis)) {
				return
			}
			cvs.css('opacity', 0);
			led.destroy();
			$(this).addClass(dis).siblings().removeClass(dis);
			btns.addClass(dis);
			btn.addClass(dis);
			input.attr('readonly', true);
		});
		$('.btn-stop').on('click', function(){
			if ($(this).hasClass(dis)) {
				return
			}
			led.stop();
			$(this).addClass(dis).siblings().removeClass(dis);
		});
		$('.btn-start').on('click', function(){
			if ($(this).hasClass(dis)) {
				return
			}
			led.start();
			$(this).addClass(dis).siblings().removeClass(dis);
		});
		$('.btn-mess').on('click', function(){
			if ($(this).hasClass(dis)) {
				return
			}
			led.shuffle();
		});
		$('.btn-reset').on('click', function(){
			if ($(this).hasClass(dis)) {
				return
			}
			led.reset();
		});
		$('.btn-clear').on('click', function(){
			if ($(this).hasClass(dis)) {
				return
			}
			led.clear();
		});
		$('.btn-input').on('keydown', function ( e ) {
			setTimeout(function(){
				if (ac.element.is(':visible')) {
					input.addClass('is-active');
				} else {
					input.removeClass('is-active');
				}
			}, 25);
			if (e.keyCode == 13 && $(this).val()!=='') {
				if (!input.hasClass('is-active')) {
					led.simulate($(this).val());
					$(this).val('');
				}
			}
		});
		// window.addEventListener('resize', function(){
		// 	led.render(window.innerWidth, window.innerHeight);
		// })
		$('.ui-console').addClass('is-active');
		btns.addClass(dis);
		btn.addClass(dis);
		input.attr('readonly', true);
	});
});