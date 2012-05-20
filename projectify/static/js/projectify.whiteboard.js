APE.whiteboardChangeListen = DUI.Class.create(APE.Client.prototype, {
	options: {
		channel: 'whiteboardChangeListen'
	},

	init: function(core, options)
	{
		this.core = core;
		this.options = options;

		this.addEvent('load', this.start);
		this.addEvent('ready', this.join);
		this.addEvent('multiPipeCreate', this.createPipe);

		this.onRaw('data', this.onRawEvent);
	},

	start: function()
	{
		console.log(1)
		this.core.start({'name':'User'+String(new Date().getTime()).substr(5)})
	},

	join: function()
    {
		console.log(2)
        this.core.join(this.options.channel);
    },

    onRawEvent: function(raw, pipe)
    {
		console.log(4)
        msg = $.parseJSON(decodeURIComponent(raw.data.msg));

        if (msg.create)
        {
        	addSticky(msg);
        }
        else
        {
        	//console.log(msg)
        	var whiteboard_offset = $("#whiteboard").offset();
        	$('#' + msg.elementId).css({'top': whiteboard_offset.top + msg.position.top, 'left': whiteboard_offset.left + msg.position.left})
        }
    },

    createPipe: function(pipe, options)
    {

		console.log(3)
        this.currentPipe = pipe;
    },

    getCurrentPipe: function()
    {
        return this.currentPipe;
    },
})