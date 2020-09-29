global.window.require = function () {
    return {
        remote: {
            require: function () {
                return {}
            }

        }
    };
};