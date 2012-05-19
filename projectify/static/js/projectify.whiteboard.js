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
		this.addEvenet('multiPipeCreate', this.createPipe);

		this.onRaw('data', this.moveObjects);
	},

	start: function()
	{
		this.core.start({'name':'User'+String(new Date().getTime()).substr(5)})
	},

	join: function()
    {
        this.core.join(this.options.channel);
    },

    moveObjects: function(raw, pipe)
    {
        msg = $.parseJSON(decodeURIComponent(raw.data.msg));
        console.log(msg);
    },

    createPipe: function(pipe, options)
    {
        this.currentPipe = pipe;
    },

    getCurrentPipe: function()
    {
        return this.currentPipe;
    },
})