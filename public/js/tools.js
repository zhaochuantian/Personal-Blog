;(function($) {

	$.extend({
		formatDate: function(timestamp, str) {
			var d = null;
			if (timestamp instanceof Date) {
				d = timestamp;
			} else {
				d = new Date(timestamp);
			}
			var year = d.getFullYear();
			var month = d.getMonth() + 1;
			var date = d.getDate();
			var week = d.getDay();
			var hours = d.getHours();
			var min = d.getMinutes();
			var sec = d.getSeconds();

			return str.replace(/(Y)|(m)|(d)|(H)|(i)|(s)|(w)/g, function($0,$1,$2,$3,$4,$5,$6,$7) {
				if ($1) {
					return year;
				}
				if ($2) {
					return $.addZero(month);
				}
				if ($3) {
					return $.addZero(date);
				}
				if ($4) {
					return $.addZero(hours);
				}
				if ($5) {
					return $.addZero(min);
				}
				if ($6) {
					return $.addZero(sec);
				}
				if ($7) {
					return $.addZero(week);
				}
			});
		},

		addZero(d) {
			return d < 10 ? '0' + d : '' + d;
		}
	});

})(jQuery);