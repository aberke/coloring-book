
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


    const GROUP_DATA = {
        'p1': {
            generators: [generators.translation],
        },
        'p11m': {
            generators: [
                generators.translation,
                generators.horizontalMirror
            ],
        },
        'p1m1': {
            generators: [
                generators.translation,
                generators.verticalMirror
            ],
        },
        'p11g': {
            generators: [
                generators.translation,
                generators.glideReflection
            ],
        },
        'p2': {
            generators: [
                generators.translation,
                generators.order2Rotation
            ],
        },
        'p2mg': {
            generators: [
                generators.translation,
                generators.verticalMirror,
                generators.glideReflection,
                generators.order2Rotation,
            ],
        },
        'p2mm': {
            generators: [
                generators.translation,
                generators.horizontalMirror,
                generators.verticalMirror,
                generators.glideReflection,
                generators.order2Rotation,
            ],
        },
    };
    return {
        GROUP_DATA: GROUP_DATA
    };
}());
