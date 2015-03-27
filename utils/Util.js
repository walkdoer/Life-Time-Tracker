

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

exports.walkTree = walkTree;