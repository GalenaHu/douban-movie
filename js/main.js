! function() {
    var view = {
        $main: $('main'),
        $section: $('section'),
        $container: $('.container'),
        $tab: $('footer>div'),
        $loading: $('.loading'),
        $endBox: $('.end'),
    }
    var model = {
        ajaxTime: true,
        index: {
            '0': 0,
            '1': 0,
            '2': 0,
        },
        start: function(sectionId, url) {
            if (view.$container.eq(sectionId).height() - view.$section.eq(sectionId).scrollTop() - view.$section.eq(sectionId).height() < 800) {
                if (this.ajaxTime) {
                    this.index[sectionId] += 20;
                    this.fetch(sectionId, url, this.index[sectionId]);
                    this.ajaxTime = false;
                }
            }
        },
        fetch: function(sectionId, targetUrl, i) {
            view.$loading.show()
            $.ajax({
                url: targetUrl,
                type: 'GET',
                dataType: 'jsonp',
                data: { start: i },
                async: false,
            }).then((response) => {
                for (let n = 0; n < response.subjects.length; n++) {
                    this.render(response.subjects[n], n, sectionId);
                    this.ajaxTime = true;
                    view.$loading.hide()
                }
                this.ajaxTime = true;
            }, () => {
                alert('Someting got wrong...');
                this.ajaxTime = true;
                view.$loading.hide()
            });
        },

        render: function(subjects, n, sectionId) {
            let item =
                `<div class="item">
                    <a href="${subjects.alt}">
                        <div class="rank-container">
                            <div class="rank">No.${this.index[sectionId]+n+1}</div>
                        </div>
                        <div class="message-container">
                            <div class="photo">
                                <img src=https://images.weserv.nl/?url=${subjects.images.small.slice(8)} width="80px" referrerpolicy='no-referrer'>
                            </div>
                            <div class="text">
                                <div class="name">
                                    <span class="title">${subjects.title}</span>
                                    <span class="year">(${subjects.year})</span>
                                </div>
                                <div class="rate-container">
                                    <span class="star">${this.setStars(subjects.rating.average)}</span>
                                    <span class="rate-number">${subjects.rating.average}</span><span>分</span>
                                </div>
                                <div class="messages">
                                    <span>${this.setArray(subjects.genres)}/</span>
                                    <span>${this.setPerson(subjects.directors)}/</span>
                                    <span>${this.setPerson(subjects.casts)}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>`
            let $node = $(item);
            view.$container.eq(sectionId).append($node)
        },
        setArray: function(array) {
            let string = '';
            for (let i = 0; i < array.length; i++) {
                string = string + array[i] + ' ';
            }
            return string
        },
        setPerson: function(array) {
            let string = '';
            for (let i = 0; i < array.length; i++) {
                let achor = `<a href="${array[i].alt}">${array[i].name}</a>` + ' ';
                string = string + achor + '';
            }
            return string
        },
        setStars: function(number) {
            if (number >= 9) {
                return '★★★★★'
            } else if (number >= 7) {
                return '★★★★☆'
            } else if (number >= 5) {
                return '★★★☆☆'
            } else if (number >= 3) {
                return '★★☆☆☆'
            } else if (number >= 1) {
                return '★☆☆☆☆'
            } else {
                return '暂无评分'
            }
        }
    }


    var controller = {
        init: function() {
            this.bind()
        },
        bind: function() {
            let sectionId = 0;
            let top250Url = 'https://api.douban.com/v2/movie/top250';
            let theaterUrl = 'https://api.douban.com/v2/movie/in_theaters';
            let searchUrl = 'https://api.douban.com/v2/movie/search';
            let newUrl = searchUrl + '?q=';

            model.fetch(sectionId, top250Url, model.index[sectionId])
            view.$tab.on('click', function(e) {
                view.$endBox.hide()
                sectionId = $(this).index();
                if (sectionId === 1) {
                    model.fetch(sectionId, theaterUrl, model.index[sectionId])
                }
                view.$section.hide().eq(sectionId).show();
                $(this).addClass('active').siblings().removeClass('active')
            })
            view.$section.scroll(function() {
                if (sectionId === 0) {
                    model.start(sectionId, top250Url)
                } else if (sectionId === 1) {
                    model.start(sectionId, theaterUrl)
                } else if (sectionId === 2) {
                    model.start(sectionId, newUrl)
                }
                if (view.$container.eq(sectionId).height() - view.$section.eq(sectionId).scrollTop() - view.$section.eq(sectionId).height() < 10) {
                    view.$endBox.show()
                    view.$loading.hide()
                }
            });
            $('.select>div').on('click', function() {
                $(this).addClass('selectActive').siblings().removeClass('selectActive')
                if (this.id === 'keyword') {
                    newUrl = searchUrl + '?q=';
                } else if (this.id === 'tag') {
                    newUrl = searchUrl + '?tag=';
                }
            })
            $('button').on('click', function(e) {
                view.$container.eq(2).empty();
                view.$loading.hide();
                view.$endBox.hide();
                e.preventDefault();
                let finalUrl = newUrl + $('input')[0].value;
                console.log(finalUrl)
                model.index[sectionId] = -20
                model.start(sectionId, finalUrl)
            })

        },
    }
    controller.init()
}.call()