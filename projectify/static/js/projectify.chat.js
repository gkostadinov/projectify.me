APE.chatboxListen = DUI.Class.create(APE.Client.prototype, {
    options: {  
        channel: 'chatboxListen',
        user: null
    },  

    init: function(core, options)
    {
        this.core = core;  
        this.options = options;
  
        this.addEvent('load', this.start);
        this.addEvent('ready', this.join); 
        this.addEvent('multiPipeCreate', this.createPipe);

        this.onRaw('data', this.rawData); 
    }, 

    start: function()
    {
        if (this.core.options.restore)
        {
            this.core.start()
        }
        else
        {
            this.core.start(
                { 'name' : 'User' + String(new Date().getTime()).substr(5) }
            );
            console.log('User' + String(new Date().getTime()).substr(5))
        }
    },

    join: function()
    {
        if (this.core.options.restore) {
            this.core.getSession('key1', function(resp) {
                console.log('Receiving sessions data. key1 value is : ', resp.data.sessions.key1);
            });
        }
        else
        {
            console.log('saving custom session data, key1 on the server');
                this.core.setSession({'key1':'value1'});
            this.core.join(this.options.channel);
        }
    },

    rawData: function(raw, pipe)
    {
        msg = $.parseJSON(decodeURIComponent(raw.data.msg));

        //if (msg.to.id == this.options.user.id)
        {
            if (typeof msg.userIsWriting !== 'undefined')
            {
                Chat.changeStatus(msg);
            }
        }
    },

    createPipe: function(pipe, options)
    {
        this.currentPipe = pipe;
    },

    getCurrentPipe: function()
    {
        return this.currentPipe;
    },
});

APE.chatbox = DUI.Class.create(APE.Client.prototype, {  
    options: {  
        container: $('#chatboxes'),
        channel: 'chatbox',
        user: null,
        chatTitle: null,
        listener: null
    },  

    lastUser: null,
    userIsWriting: false,
  
    init: function(core, options)
    {  
        this.core = core;  
        this.options = options;
  
        this.addEvent('load', this.start); 
        this.addEvent('ready', this.createChat); 
        this.addEvent('multiPipeCreate', this.createPipe);
 
        this.onRaw('data', this.rawData); 
        this.onCmd('send', this.cmdSend);
    }, 
    
    start: function()
    {
        this.core.start(
            { 'name' : 'User' + String(new Date().getTime()).substr(5) }
        );
    },

    createChat: function()
    {
        var that = this;

        var chatboxTop = $('<div></div>')
            .addClass('top')
            .click(function() {
                var isMinimized = that.options.chatboxElement.hasClass('minimized');
                if (!isMinimized) that.options.chatboxElement.addClass('minimized');
                else that.options.chatboxElement.removeClass('minimized');
                that.options.chatboxElement.find('.messages').animate({ scrollTop: 60000 }, 0);
                that.options.chatboxElement.find('input').focus();
            });
        var status = $('<div></div>')
            .addClass('status')
            .appendTo(chatboxTop);
        var title = $('<div></div>')
            .addClass('title')
            .html(decodeURIComponent(this.options.chatTitle))
            .appendTo(chatboxTop);
        var close = $('<div></div>')
            .addClass('close')
            .html('&times;')
            .click(function() {
                /*$(this).parent().parent().addClass('hidden').hide();

                var j = 0;
                while (j < Chat.usersCount) {
                    if (Chat.users[j] == that.options.userTo.id) 
                    {
                        that.core.left(that.currentPipe.getPubid());
                        Chat.users.splice(j, 1);
                        Chat.usersCount--;
                    }
                    else j++;
                }*/
            })
            .appendTo(chatboxTop);

        var chatboxMessages = $('<div></div>')
            .addClass('messages')
            .click(function() {
                $(this).parent().find('input').focus();
            });

        var writingStatus = $('<div></div>')
            .addClass('writing-status');

        var chatboxBottom = $('<div></div>').addClass('bottom');
        var input = $('<input>')
            .attr('type', 'text')
            .attr('name', 'send_message')
            .addClass('send-message')
            .keydown(function(e) {
                var value = $(this).val();
                var valLenght = value.length;
                var sendWritingStatus = false;

                if (valLenght > 1
                    && that.userIsWriting == false)
                {
                    that.userIsWriting = true;
                    sendWritingStatus = true;

                }
                else if (valLenght <= 1
                    && that.userIsWriting == true)
                {
                    that.userIsWriting = false;
                    sendWritingStatus = true;
                }

                if(e.which == 13 && !e.shiftKey) {
                    if($.trim(value) == '') return;

                    that.userIsWriting = false;
                    sendWritingStatus = true;

                    var core_user = { "properties": that.core.user.properties }
                    var message = {
                        "text": decodeURIComponent(value),
                        "user": core_user,
                        "from": that.options.user
                    }
                    message = JSON.stringify(message);

                    that.options.listener.getCurrentPipe().send(message);
                    that.getCurrentPipe().send(message);
                    
                    $(this).val('');
                    e.preventDefault();
                }

                if (sendWritingStatus)
                {
                    var writingStatus = {
                        "userIsWriting": that.userIsWriting,
                        "user": core_user,
                        "from": that.options.user
                    }
                    writingStatus = JSON.stringify(writingStatus);
                    that.options.listener.getCurrentPipe().send(writingStatus);
                }
            })
            .appendTo(chatboxBottom);

        this.options.chatboxElement = $('<div></div>')
            .addClass('chatbox')
            .append(chatboxTop)
            .append(chatboxMessages)
            .append(writingStatus)
            .append(chatboxBottom);

        this.options.container.append(this.options.chatboxElement);

        this.options.chatboxElement.find('input').focus();

        this.core.join(this.options.channel);
    },

    createPipe: function(pipe, options)
    {
        this.currentPipe = pipe;
    },

    rawData: function(raw, pipe)
    {
        this.addMsg(raw.data.from, raw.data.msg);
    },

    cmdSend: function(data, pipe)
    {
        this.addMsg(this.core.user, data.msg);
    },

    parseMsg: function(msg)
    {
        function wbr(str, num) {  
            return str.replace(RegExp("(\\w{" + num + "})(\\w)", "g"), function(all,text,char){ 
                return text + "<wbr>" + char; 
            }); 
        }

        var expression = /(\b(https?|ftp|file):\/\/[-A-ZА-Я0-9+&@#\/%?=~_|!:,.;]*[-A-ZА-Я0-9+&@#\/%=~_|])/ig;

        msg = msg.replace(expression, "<a href='$1' target='_blank'>$1</a>"); 
        msg = wbr(msg, 20);

        msg = msg.replace(/\*\*(\S(.*?\S)?)\*\*/gm, '<strong>$1</strong>')
        msg = msg.replace(/\_\_(\S(.*?\S)?)\_\_/gm, '<strong>$1</strong>')
        msg = msg.replace(/\*(\S(.*?\S)?)\*/gm, '<em>$1</em>')
        msg = msg.replace(/\_(\S(.*?\S)?)\_/gm, '<em>$1</em>');

        msg = msg.replace(/(:\)|:\(|:D|;\(|;\)|:S|:\||:@)/gm, '<span class="emoticon">$1</span>')
        msg = msg.replace(/(:-\)|:-\(|:-D|;-\(|;-\)|:-S|:-\||:-@)/gm, '<span class="emoticon">$1</span>');

        msg = $('<div>' + msg + '</div>');

        $.each(msg.find('a'), function() {
            var href = $(this).attr('href');
            href = href.replace(/(<wbr>)/igm, '');
            href = href.replace(/(<em>)|(<\/em>)/igm, '_')
            href = href.replace(/(<strong>)|(<\/strong>)/igm, '__')

            $(this).attr('href', href);
            $(this).html(wbr(href, 8));
        });

        msg = msg.html();

        return msg;
    },

    addMsg: function(from, msg)
    {
        msg = $.parseJSON(decodeURIComponent(msg));

        //if ((msg.to.id == this.options.user.id && msg.from.id == this.options.userTo.id)
        //    || from.properties.name == this.core.user.properties.name)

        //{
        msg.text = $('<div></div>').text(msg.text).html();
        msg.text = this.parseMsg(msg.text);
        console.log(from.properties.name)
        if (from.properties.name == this.lastUser)
        {
            this.options.chatboxElement.find('.messages .text').last().append('<br>' + msg.text);
        }
        else
        {
            this.lastUser = from.properties.name;

            var message = $('<div></div>').addClass('message');

            if (from.properties.name == this.core.user.properties.name) message.addClass('right');
            else message.addClass('left');

            var avatar = $('<div></div>').addClass('avatar');
            var avatarImg = $('<img>')
                .attr('src', 'http://placehold.it/50x50')
                .attr('alt', 'avatar')
                .appendTo(avatar);

            avatar.appendTo(message);

            var text = $('<div></div>')
                .addClass('text')
                .html(msg.text)
                .appendTo(message);

            this.options.chatboxElement.find('.messages').append(message);

            var isHidden = this.options.chatboxElement.hasClass('hidden');
            if (isHidden) this.options.chatboxElement.removeClass('hidden').show();
        }
        /*
        if (from.properties.name != this.core.user.properties.name)
        {
            Nibiru.bubbleSound.load();
            Nibiru.bubbleSound.play();
            
            if (window.webkitNotifications 
                && document.hasFocus)
            {
                if (window.webkitNotifications.checkPermission() == 0
                    && !document.hasFocus())
                {
                    var notificationContent = $("<div></div>").html(msg.text).text();
                    var desktopNotification = window
                        .webkitNotifications
                        .createNotification(msg.from.avatar, 'From: ' + decodeURIComponent(msg.from.name) + ' on intrest.in', notificationContent);
                        
                    desktopNotification.show();

                    setTimeout(function() {
                        desktopNotification.cancel()
                    }, 5000)
                }
            }
        }
        */
        //}

        this.options.chatboxElement.find('.messages').animate({ scrollTop: 60000 }, 0);
    },

    getCurrentPipe: function()
    {
        return this.currentPipe;
    },
});

var Chat = (function() 
{
    /* Globally defined variables */
    var Chat = this;

    var client = new APE.Client();
    var chatboxListener = null;

    this.user = null;
    
    this.initListener = function(user)
    {
        Chat.user = user;
        client.load({
            'identifier': 'chatboxListen',
            'channel': 'chatboxListen',
            'complete': function(ape)
            {
                chatboxListener = new APE.chatboxListen(ape, {
                    channel: 'chatboxListen',
                    user: Chat.user
                });
                Chat.initChatbox();
            }
        });

    }

    this.initChatbox = function()
    {
        client.load({
            'identifier': 'chatbox',
            'channel': 'chatbox',
            'complete': function(ape)
            {
                var chatbox = new APE.chatbox(ape, {
                    container: $('#chatboxes'),
                    channel: 'chatbox',
                    user: Chat.user,
                    chatTitle: "Chat",
                    listener: chatboxListener
                });
            }
        });
    }

    this.changeStatus = function(message)
    {
        var text = (message.userIsWriting) ? decodeURIComponent(message.from.name) + (' is typing.') : '';
        $('.writing-status').html(text);
    }
});

var Chat = new Chat();