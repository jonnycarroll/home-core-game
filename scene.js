class IsoScene {
    constructor(objects = []) {
        this.objects = objects;
    }

    static createDefault(cubeHeight) {
        return new IsoScene([
            {
                type: 'cuboid',
                x: 0,
                y: 0,
                levels: 3,
                height: cubeHeight,
                colors: {
                    top: 'rgba(70, 190, 255, 0.96)',
                    right: 'rgba(0, 125, 210, 0.96)',
                    left: 'rgba(0, 85, 165, 0.96)',
                    separator: 'rgba(190, 235, 255, 0.32)'
                }
            }
        ]);
    }
}

if (typeof module !== 'undefined') {
    module.exports = IsoScene;
}
