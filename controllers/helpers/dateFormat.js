const helper = {
    format: function (date){
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    },
    validate: function (date){
        return date.every(x => !isNaN(Date.parse(x)));
    },
    compare: function (date1, date2){
        return new Date(date1).getTime() < new Date(date2).getTime();
    },
    dateRange: function (date1, date2){
        date1 = this.format(date1);
        date2 = this.format(date2);

        if(!this.validate([date1, date2]))
            return false;

        if(!this.compare(date1, date2))
            return false;

        return {
            start: date1,
            end: date2
        }
    }
}

module.exports = helper;