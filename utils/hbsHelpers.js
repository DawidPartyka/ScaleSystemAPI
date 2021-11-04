const menuList = (list) => {
    if(!list)
        return '';

    let dropdown = '';

    list.forEach((elem) => {
        dropdown += '<li class="nav-item dropdown">' +
            '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" ' +
            'aria-haspopup="true" aria-expanded="false">' +
            elem.name + '</a><div class="dropdown-menu" aria-labelledby="navbarDropdown">' +
            elem.panels.reduce((prev, cur) => {
                return prev + '<a class="dropdown-item" href="' + cur.href +'">' + cur.name + '</a>';
            }, '') +
            '</div></li>';
    });

    return dropdown;
}

exports.menuList = menuList;