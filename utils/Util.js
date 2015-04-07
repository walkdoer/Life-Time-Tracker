var Moment = require('moment');

function walkTree(parentElement, func) {
    parentElement.depth = 0;
    parentElement.next = null;
    var children, i, len, child;
    var depth, current;
    current = parentElement;
    while (current) {
        depth = current.depth;
        children = current.children;
        var done = func(current);
        if (done === false) {
            return;
        }
        //removes this item from the linked list
        current = current.next;
        for (i = 0, len = children ? children.length : 0; i < len; i++) {
            child = children[i];
            child.depth = depth + 1;
            //place new item at the head of the list
            child.next = current;
            current = child;
        }
    }
}

function toDate(type) {
    var params = {};
    if (type === 'yesterday') {
        params.start = new Moment().subtract(1, 'day').startOf('day').toDate();
        params.end = new Moment().subtract(1, 'day').endOf('day').toDate();
    } else if (type === 'weekly' || type === 'week') {
        params.start = new Moment().startOf('week').toDate();
        params.end = new Moment().endOf('week').toDate();
    } else if ( type === 'today' || type === 'day') {
        params.start = new Moment().startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    } else if ( type === 'monthly' || type === 'month') {
        params.start = new Moment().startOf('month').toDate();
        params.end = new Moment().endOf('month').toDate();
    } else if ( type === 'last_seven_day') {
        params.start = new Moment().subtract(7, 'day').startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    } else if ( type === 'last_three_day') {
        params.start = new Moment().subtract(3, 'day').startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    } else if (type === 'last_month') {
        params.start = new Moment().subtract(1, 'month').startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    }
    return params;
}



exports.walkTree = walkTree;
exports.toDate = toDate;