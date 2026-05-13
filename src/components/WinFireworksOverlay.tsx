import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;

type Props = {
  visible: boolean;
};

export default function WinFireworksOverlay({ visible }: Props) {
  const particles = useMemo(() => {
    const colors = ['#FF6B9D', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8F56', '#C77DFF', '#FFFFFF', '#FF4D4D'];
    const n = 56;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.2),
      color: colors[i % colors.length],
      angle: (Math.PI * 2 * i) / n + Math.random() * 0.35,
      dist: 70 + Math.random() * 140,
    }));
  }, []);

  const runRef = useRef(0);

  useEffect(() => {
    if (!visible) {
      particles.forEach((p) => {
        p.x.setValue(0);
        p.y.setValue(0);
        p.opacity.setValue(0);
        p.scale.setValue(0.2);
      });
      return;
    }

    const runId = ++runRef.current;
    particles.forEach((p) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(0);
      p.scale.setValue(0.2);
    });

    const anim = Animated.stagger(
      12,
      particles.map((p) =>
        Animated.parallel([
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 1, duration: 90, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0, duration: 1200, delay: 120, useNativeDriver: true }),
          ]),
          Animated.timing(p.scale, { toValue: 1.1 + Math.random() * 0.45, duration: 520, useNativeDriver: true }),
          Animated.timing(p.x, {
            toValue: Math.cos(p.angle) * p.dist,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: Math.sin(p.angle) * p.dist + 30 + Math.random() * 40,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      )
    );

    anim.start(() => {
      if (runRef.current === runId) {
        particles.forEach((p) => p.opacity.setValue(0));
      }
    });

    return () => {
      anim.stop();
    };
  }, [visible, particles]);

  if (!visible) return null;

  const originTop = H * 0.26;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 50 }]} collapsable={false}>
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={{
            position: 'absolute',
            left: W / 2 - 4,
            top: originTop,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
          }}
        />
      ))}
    </View>
  );
}
