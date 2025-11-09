import { useContext, useMemo } from 'react';
import { LocalizationContext } from './LocalizationContext';

export const useRTL = () => {
    const { isRTL, layoutDirection } = useContext(LocalizationContext);

    const rtlStyles = useMemo(() => ({
        row: { flexDirection: layoutDirection.flexDirection },
        rowReverse: { flexDirection: layoutDirection.reverseFlexDirection },
        rowBetween: { flexDirection: layoutDirection.flexDirection, justifyContent: 'space-between', alignItems: 'center' },
        rowCenter: { flexDirection: layoutDirection.flexDirection, alignItems: 'center' },
        textAlign: { textAlign: layoutDirection.textAlign },
        oppositeTextAlign: { textAlign: layoutDirection.oppositeTextAlign },
        writingDirection: { writingDirection: layoutDirection.writingDirection },
        alignStart: { alignItems: layoutDirection.alignStart },
        alignEnd: { alignItems: layoutDirection.alignEnd },
        alignSelfStart: { alignSelf: layoutDirection.alignStart },
        alignSelfEnd: { alignSelf: layoutDirection.alignEnd },
        iconRotation: { transform: [{ rotate: isRTL ? '180deg' : '0deg' }] },
        startAbsolute: { [isRTL ? 'right' : 'left']: 0 },
        endAbsolute: { [isRTL ? 'left' : 'right']: 0 },
    }), [isRTL, layoutDirection]);

    return { isRTL, layoutDirection, rtlStyles };
};

