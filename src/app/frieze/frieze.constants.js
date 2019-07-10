
const frieze = (function() {
    'use strict';

    const generators = {
        translation: {
            text: 'Translation'
        },
        horizontalMirror: {
            text: 'Horizontal mirror reflection',
            class: 'horizontal-mirror'
        },
        verticalMirror: {
            text: 'Vertical mirror reflection',
            class: 'vertical-mirror'
        },
        glideReflection: {
            text: 'Glide reflection',
            class: 'glide-reflection'
        },
        order2Rotation: {
            text: 'Order 2 rotations',
            class: 'rotation'
        }
    };


    const GROUP_DATA = [
        {
            generators: [generators.translation],
            names: {
                orbifold: '∞∞',
                IUC: 'p1',
            },
        },
        {
            generators: [
                generators.translation,
                generators.horizontalMirror
            ],
            names: {
                orbifold: '∞∗',
                IUC: 'p11m',
            },
        },
        {
            generators: [
                generators.translation,
                generators.verticalMirror
            ],
            names: {
                orbifold: '∗∞∞',
                IUC: 'p1m1',
            },
        },
        {
            generators: [
                generators.translation,
                generators.glideReflection
            ],
            names: {
                orbifold: '∞×',
                IUC: 'p11g',
            },
        },
        {
            generators: [
                generators.translation,
                generators.order2Rotation
            ],
            names: {
                orbifold: '22∞',
                IUC: 'p2',
            },
        },
        {
            generators: [
                generators.translation,
                generators.verticalMirror,
                generators.glideReflection,
                generators.order2Rotation,
            ],
            names: {
                orbifold: '2∗∞',
                IUC: 'p2mg',
            },
        },
        {
            generators: [
                generators.translation,
                generators.horizontalMirror,
                generators.verticalMirror,
                generators.glideReflection,
                generators.order2Rotation,
            ],
            names: {
                orbifold: '∗22∞',
                IUC: 'p2mm',
            },
        },
    ];
    return {
        GROUP_DATA: GROUP_DATA
    };
}());
