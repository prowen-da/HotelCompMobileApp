import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  Layout,
} from 'react-native-reanimated';
import Svg, {
  Polygon,
  Polyline,
  Line,
  Circle as SvgCircle,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Scores', 'Prices', 'Trends', 'Matrix'];
const TAB_WIDTH = (width - 50) / TABS.length;

// ── Data ──────────────────────────────────────────────────────────────────────
const hotels = [
  { id: 0, name: 'The Grand Palace Hotel', short: 'Palace', color: '#667eea', gradient: ['#667eea', '#764ba2'] as [string, string], rating: 4.6, price: 120, score: 91 },
  { id: 1, name: 'Urban Nest Suites',       short: 'Urban',  color: '#a78bfa', gradient: ['#a78bfa', '#c084fc'] as [string, string], rating: 4.2, price: 100, score: 85 },
  { id: 2, name: 'Lakeview Residency',      short: 'Lake',   color: '#11998e', gradient: ['#11998e', '#38ef7d'] as [string, string], rating: 4.5, price: 95,  score: 97 },
  { id: 3, name: 'Royal Orchid Central',    short: 'Orchid', color: '#2193b0', gradient: ['#2193b0', '#6dd5ed'] as [string, string], rating: 4.0, price: 110, score: 68 },
  { id: 4, name: 'Bloom Boutique',          short: 'Bloom',  color: '#1D976C', gradient: ['#1D976C', '#93F9B9'] as [string, string], rating: 4.3, price: 88,  score: 72 },
];

const scoreData = [
  { hotel: 'The Grand Palace', short: 'Palace', color: '#667eea', scores: [9.1, 9.0, 9.5, 8.5, 9.2] },
  { hotel: 'Urban Nest Suites', short: 'Urban',  color: '#a78bfa', scores: [8.4, 7.5, 8.8, 9.2, 8.0] },
  { hotel: 'Lakeview Resort',   short: 'Lake',   color: '#11998e', scores: [7.8, 8.0, 7.5, 8.0, 7.9] },
  { hotel: 'Royal Orchid Hotel', short: 'Orchid', color: '#2193b0', scores: [8.0, 8.5, 8.0, 7.8, 8.1] },
  { hotel: 'Bloom Boutique',    short: 'Bloom',  color: '#1D976C', scores: [8.2, 7.8, 8.5, 8.2, 8.0] },
];

const SCORE_LABELS = ['Clean', 'Service', 'Location', 'Value', 'Comfort'];

const priceData = [
  { short: 'Palace', color: '#667eea', prices: [145, 150, 155, 152] },
  { short: 'Urban',  color: '#a78bfa', prices: [125, 118, 130, 128] },
  { short: 'Lake',   color: '#11998e', prices: [110, 108, 115, 112] },
  { short: 'Orchid', color: '#2193b0', prices: [135, 140, 138, 142] },
  { short: 'Bloom',  color: '#1D976C', prices: [95,  92,  98,  96] },
];

const PLATFORMS = ['Agoda', 'Booking', 'MakeMyTrip', 'Expedia'];

const priceHistory = [
  { short: 'Palace', color: '#667eea', data: [148, 145, 152, 149, 143, 147, 145] },
  { short: 'Urban',  color: '#a78bfa', data: [122, 128, 125, 120, 118, 124, 125] },
  { short: 'Lake',   color: '#11998e', data: [108, 112, 110, 107, 105, 109, 110] },
  { short: 'Orchid', color: '#2193b0', data: [138, 142, 135, 140, 138, 133, 135] },
  { short: 'Bloom',  color: '#1D976C', data: [92,  95,  93,  90,  88,  91,  95] },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const sentimentData = [
  { pos: 7, neu: 2, neg: 1 },
  { pos: 6, neu: 3, neg: 1 },
  { pos: 8, neu: 1, neg: 1 },
  { pos: 5, neu: 3, neg: 2 },
  { pos: 7, neu: 2, neg: 1 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const scoreColor = (s: number) => s >= 9 ? '#10B981' : s >= 8 ? '#6EE7B7' : s >= 7 ? '#FCD34D' : '#F87171';

function heatColor(score: number) {
  const t = Math.max(0, Math.min(1, (score - 6) / 4));
  const r = Math.round(239 - t * 223);
  const g = Math.round(68  + t * 117);
  const b = Math.round(68  + t * 61);
  return `rgb(${r},${g},${b})`;
}

// ── Radar chart helpers ───────────────────────────────────────────────────────
const RADAR_SIZE  = width - 80;
const RADAR_CX    = RADAR_SIZE / 2;
const RADAR_CY    = RADAR_SIZE / 2;
const RADAR_R     = RADAR_SIZE * 0.36;
const NUM_AXES    = 5;

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: RADAR_CX + r * Math.cos(rad), y: RADAR_CY + r * Math.sin(rad) };
}

function radarPoints(scores: number[]) {
  return scores.map((s, i) => {
    const { x, y } = polar((360 / NUM_AXES) * i, (s / 10) * RADAR_R);
    return `${x},${y}`;
  }).join(' ');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AnimatedBar({ hotel, index }: { hotel: typeof hotels[0]; index: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(index * 100, withSpring(hotel.score * 1.8, { damping: 12 }));
  }, []);
  const s = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <View style={styles.barCol}>
      <Text style={styles.barScore}>{hotel.score}</Text>
      <Animated.View style={[styles.bar, s, { backgroundColor: hotel.color }]} />
      <Text style={styles.barLabel}>{hotel.short}</Text>
    </View>
  );
}

function SentimentRow({ hotel, index, pos, neu, neg }: {
  hotel: typeof hotels[0]; index: number; pos: number; neu: number; neg: number;
}) {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(index * 150, withTiming(1, { duration: 800 }));
  }, []);
  const s = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.value }] }));
  return (
    <Animated.View style={styles.sentRow} entering={FadeInDown.delay(index * 80)}>
      <View style={styles.sentHeader}>
        <View style={[styles.dot, { backgroundColor: hotel.color }]} />
        <Text style={styles.sentName}>{hotel.name}</Text>
        <Text style={styles.sentCount}>{(1.2 + index * 0.4).toFixed(1)}k</Text>
      </View>
      <Animated.View style={[styles.sentBar, s]}>
        <View style={[styles.sentSeg, { flex: pos, backgroundColor: '#10B981' }]} />
        <View style={[styles.sentSeg, { flex: neu, backgroundColor: '#9CA3AF' }]} />
        <View style={[styles.sentSeg, { flex: neg, backgroundColor: '#EF4444' }]} />
      </Animated.View>
    </Animated.View>
  );
}

function RadarChart({ visible }: { visible: Set<number> }) {
  const levels = [2, 4, 6, 8, 10];
  const axisLabels = ['Clean', 'Service', 'Location', 'Value', 'Comfort'];
  return (
    <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
      {/* Grid rings */}
      {levels.map(lvl => (
        <Polygon
          key={lvl}
          points={Array.from({ length: NUM_AXES }, (_, i) => {
            const { x, y } = polar((360 / NUM_AXES) * i, (lvl / 10) * RADAR_R);
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {/* Axis spokes */}
      {Array.from({ length: NUM_AXES }, (_, i) => {
        const end = polar((360 / NUM_AXES) * i, RADAR_R);
        return (
          <Line key={i} x1={RADAR_CX} y1={RADAR_CY} x2={end.x} y2={end.y}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        );
      })}
      {/* Hotel polygons */}
      {scoreData.map((h, idx) => {
        if (!visible.has(idx)) return null;
        return (
          <React.Fragment key={h.hotel}>
            <Polygon
              points={radarPoints(h.scores)}
              fill={h.color + '28'}
              stroke={h.color}
              strokeWidth={2}
            />
            {h.scores.map((sc, si) => {
              const { x, y } = polar((360 / NUM_AXES) * si, (sc / 10) * RADAR_R);
              return <SvgCircle key={si} cx={x} cy={y} r={4} fill={h.color} />;
            })}
          </React.Fragment>
        );
      })}
      {/* Axis labels */}
      {axisLabels.map((lbl, i) => {
        const { x, y } = polar((360 / NUM_AXES) * i, RADAR_R + 22);
        return (
          <SvgText key={lbl} x={x} y={y}
            textAnchor="middle" alignmentBaseline="middle"
            fontSize={10} fill="rgba(255,255,255,0.55)">
            {lbl}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// Grouped bar chart — 5 hotels × 4 platforms, grouped by platform
const CHART_W = width - 108;
const CHART_H = 180;
const GROUP_W  = CHART_W / PLATFORMS.length;
const BAR_W    = (GROUP_W * 0.7) / hotels.length;

function GroupedBarChart() {
  const maxP = Math.max(...priceData.flatMap(h => h.prices)) + 20;
  return (
    <View>
      <Svg width={CHART_W} height={CHART_H}>
        {/* Y-grid */}
        {[0, 50, 100, 150, 200].filter(v => v <= maxP).map(v => {
          const y = CHART_H - (v / maxP) * CHART_H;
          return (
            <React.Fragment key={v}>
              <Line x1={0} y1={y} x2={CHART_W} y2={y}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <SvgText x={-3} y={y + 4} textAnchor="end" fontSize={8}
                fill="rgba(255,255,255,0.35)">${v}</SvgText>
            </React.Fragment>
          );
        })}
        {/* Bars */}
        {PLATFORMS.map((_, pi) => {
          const groupX = pi * GROUP_W + GROUP_W * 0.15;
          return priceData.map((hotel, hi) => {
            const bh = (hotel.prices[pi] / maxP) * CHART_H;
            const x  = groupX + hi * BAR_W;
            const y  = CHART_H - bh;
            return (
              <Rect key={`${pi}-${hi}`}
                x={x} y={y} width={BAR_W * 0.8} height={bh}
                fill={hotel.color} opacity={0.88} rx={2} />
            );
          });
        })}
      </Svg>
      {/* X labels */}
      <View style={{ flexDirection: 'row', width: CHART_W, marginTop: 6 }}>
        {PLATFORMS.map(p => (
          <Text key={p} style={styles.axisLabel}>{p}</Text>
        ))}
      </View>
    </View>
  );
}

// Price trend line chart
const LINE_W = width - 108;
const LINE_H = 170;

function PriceTrendChart({ visible }: { visible: Set<number> }) {
  const allVals = priceHistory.flatMap(h => h.data);
  const minV = Math.min(...allVals) - 8;
  const maxV = Math.max(...allVals) + 8;
  const range = maxV - minV;
  const sx = (i: number) => (i / (DAY_LABELS.length - 1)) * LINE_W;
  const sy = (v: number) => LINE_H - ((v - minV) / range) * LINE_H;

  return (
    <View>
      <Svg width={LINE_W} height={LINE_H + 4} style={{ overflow: 'visible' }}>
        {/* Y-grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = f * LINE_H;
          const val = Math.round(maxV - f * range);
          return (
            <React.Fragment key={f}>
              <Line x1={0} y1={y} x2={LINE_W} y2={y}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <SvgText x={-3} y={y + 4} textAnchor="end" fontSize={8}
                fill="rgba(255,255,255,0.35)">${val}</SvgText>
            </React.Fragment>
          );
        })}
        {/* Lines */}
        {priceHistory.map((h, hi) => {
          if (!visible.has(hi)) return null;
          const pts = h.data.map((v, i) => `${sx(i)},${sy(v)}`).join(' ');
          return (
            <React.Fragment key={h.short}>
              <Polyline points={pts} fill="none" stroke={h.color}
                strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {h.data.map((v, i) => (
                <SvgCircle key={i} cx={sx(i)} cy={sy(v)} r={3.5} fill={h.color} />
              ))}
              {/* End label */}
              <SvgText x={sx(h.data.length - 1) + 6} y={sy(h.data[h.data.length - 1]) + 4}
                fontSize={9} fill={h.color} fontWeight="bold">
                ${h.data[h.data.length - 1]}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
      {/* X labels */}
      <View style={{ flexDirection: 'row', width: LINE_W, marginTop: 8 }}>
        {DAY_LABELS.map(d => (
          <Text key={d} style={styles.axisLabel}>{d}</Text>
        ))}
      </View>
    </View>
  );
}

// Amenity heatmap
const HEAT_LABEL_W = 62;
const HEAT_CELL_W  = (width - 80 - HEAT_LABEL_W - 16) / scoreData.length;
const HEAT_CELL_H  = 36;

function HeatmapMatrix() {
  return (
    <View>
      {/* Header */}
      <View style={{ flexDirection: 'row', marginBottom: 6, paddingLeft: HEAT_LABEL_W }}>
        {scoreData.map(h => (
          <View key={h.hotel} style={{ width: HEAT_CELL_W, alignItems: 'center' }}>
            <View style={[styles.dot, { backgroundColor: h.color, marginBottom: 2 }]} />
            <Text style={styles.heatHdr}>{h.short}</Text>
          </View>
        ))}
      </View>
      {/* Rows */}
      {SCORE_LABELS.map((cat, ci) => (
        <View key={cat} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <View style={{ width: HEAT_LABEL_W, justifyContent: 'center' }}>
            <Text style={styles.heatRowLbl}>{cat}</Text>
          </View>
          {scoreData.map((h, hi) => {
            const sc = h.scores[ci];
            return (
              <Animated.View key={hi}
                entering={ZoomIn.delay(ci * 70 + hi * 35)}
                style={[styles.heatCell, {
                  width: HEAT_CELL_W,
                  backgroundColor: heatColor(sc) + 'CC',
                }]}>
                <Text style={styles.heatVal}>{sc}</Text>
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Hotel toggle chips (shared by Radar, Trends)
function HotelToggle({ visible, onToggle }: {
  visible: Set<number>;
  onToggle: (i: number) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
      {hotels.map((h, i) => {
        const on = visible.has(i);
        return (
          <TouchableOpacity key={h.id} onPress={() => onToggle(i)}
            style={[styles.chip, {
              borderColor: h.color,
              backgroundColor: on ? h.color + '2A' : 'transparent',
            }]}>
            <View style={[styles.chipDot, { backgroundColor: on ? h.color : 'rgba(255,255,255,0.2)' }]} />
            <Text style={[styles.chipText, { color: on ? h.color : 'rgba(255,255,255,0.35)' }]}>
              {h.short}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ComparisonScreen() {
  const [activeTab, setActiveTab]       = useState(0);
  const [visible, setVisible]           = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const insets                          = useSafeAreaInsets();
  const tabX                            = useSharedValue(0);
  const bookScale                       = useSharedValue(1);

  const bestHotel = hotels.reduce((p, c) => p.score > c.score ? p : c);

  useEffect(() => {
    tabX.value = withSpring(activeTab * TAB_WIDTH, { damping: 15 });
  }, [activeTab]);

  const tabIndicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tabX.value }] }));
  const bookBtnStyle      = useAnimatedStyle(() => ({ transform: [{ scale: bookScale.value }] }));

  const toggleHotel = (i: number) => {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(i)) { if (next.size > 1) next.delete(i); }
      else next.add(i);
      return next;
    });
  };

  // ── Overview ────────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <>
      {/* Best Choice Card */}
      <Animated.View style={styles.bestCard} entering={FadeInDown.delay(200).springify()}>
        <LinearGradient colors={['#0d665c', '#11998e']} style={styles.bestGrad}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.bestHeader}>
            <Animated.View entering={ZoomIn.delay(400)}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </Animated.View>
            <Text style={styles.bestLabel}>Best Overall Choice</Text>
          </View>
          <Text style={styles.bestTitle}>{bestHotel.name.toUpperCase()}</Text>
          <Text style={styles.bestDesc}>
            Stands out after comparing price, reviews, location, and overall value.
          </Text>
          <View style={styles.bestFooter}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Animated.View style={styles.tag} entering={SlideInLeft.delay(500)}>
                <Text style={styles.tagTxt}>Top Rated</Text>
              </Animated.View>
              <Animated.View style={styles.tag} entering={SlideInLeft.delay(620)}>
                <Text style={styles.tagTxt}>Best Value</Text>
              </Animated.View>
            </View>
            <Animated.View style={{ alignItems: 'flex-end' }} entering={ZoomIn.delay(700)}>
              <Text style={styles.compositeVal}>{(bestHotel.score / 10).toFixed(1)}</Text>
              <Text style={styles.compositeLabel}>Composite score</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Radar Chart */}
      <Animated.View style={styles.card} entering={FadeInUp.delay(300).springify()}>
        <Text style={styles.cardTitle}>PERFORMANCE RADAR</Text>
        <Text style={styles.cardSub}>Tap hotels to toggle — all 5 dimensions at once</Text>
        <HotelToggle visible={visible} onToggle={toggleHotel} />
        <View style={{ alignItems: 'center' }}>
          <RadarChart visible={visible} />
        </View>
        {/* Radar legend */}
        <View style={styles.legendRow}>
          {scoreData.map(h => (
            <View key={h.hotel} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: h.color }]} />
              <Text style={styles.legendTxt}>{h.short}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Overall Score Bars */}
      <Animated.View style={styles.card} entering={FadeInUp.delay(480).springify()}>
        <Text style={styles.cardTitle}>OVERALL SCORE COMPARISON</Text>
        <Text style={styles.cardSub}>Higher bar = better composite performance</Text>
        <View style={styles.barChart}>
          {hotels.map((h, i) => <AnimatedBar key={h.id} hotel={h} index={i} />)}
        </View>
      </Animated.View>

      {/* Sentiment Distribution */}
      <Animated.View style={styles.card} entering={FadeInUp.delay(640).springify()}>
        <Text style={styles.cardTitle}>SENTIMENT DISTRIBUTION</Text>
        <Text style={styles.cardSub}>Based on guest review analysis</Text>
        {hotels.map((h, i) => (
          <SentimentRow key={h.id} hotel={h} index={i}
            pos={sentimentData[i].pos}
            neu={sentimentData[i].neu}
            neg={sentimentData[i].neg} />
        ))}
        <View style={styles.legendRow}>
          {[['#10B981', 'Positive'], ['#9CA3AF', 'Neutral'], ['#EF4444', 'Negative']].map(([c, l]) => (
            <View key={l} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: c }]} />
              <Text style={styles.legendTxt}>{l}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </>
  );

  // ── Scores ──────────────────────────────────────────────────────────────────
  const renderScores = () => (
    <Animated.View style={styles.card} entering={FadeIn.duration(300)} layout={Layout}>
      <Text style={styles.cardTitle}>DETAILED SCORE BREAKDOWN</Text>
      <Text style={styles.cardSub}>Scroll right to see all categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 10, marginBottom: 6 }]}>
            <View style={styles.nameCell} />
            {SCORE_LABELS.map(lbl => (
              <View key={lbl} style={styles.scoreCell}>
                <Text style={styles.scoreHdr}>{lbl}</Text>
              </View>
            ))}
          </View>
          {/* Rows */}
          {scoreData.map((row, ri) => (
            <Animated.View key={row.hotel} style={styles.tableRow} entering={SlideInRight.delay(ri * 90)}>
              <View style={styles.nameCell}>
                <View style={[styles.dot, { backgroundColor: row.color }]} />
                <Text style={styles.nameTxt}>{row.short}</Text>
              </View>
              {row.scores.map((sc, si) => (
                <Animated.View key={si} style={styles.scoreCell}
                  entering={ZoomIn.delay(ri * 90 + si * 45)}>
                  <View style={[styles.scoreBadge, { backgroundColor: scoreColor(sc) + '2E' }]}>
                    <Text style={[styles.scoreTxt, { color: scoreColor(sc) }]}>{sc}</Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.legendRow, { marginTop: 18, flexWrap: 'wrap' }]}>
        {[['#10B981', 'Excellent (9+)'], ['#6EE7B7', 'Good (8-9)'], ['#FCD34D', 'Avg (7-8)'], ['#F87171', 'Fair (<7)']].map(([c, l]) => (
          <View key={l} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: c }]} />
            <Text style={styles.legendTxt}>{l}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  // ── Prices ──────────────────────────────────────────────────────────────────
  const renderPrices = () => (
    <Animated.View style={styles.card} entering={FadeIn.duration(300)} layout={Layout}>
      <Text style={styles.cardTitle}>PLATFORM PRICE COMPARISON</Text>
      <Text style={styles.cardSub}>Price per night — grouped by platform</Text>

      {/* Hotel color legend */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {priceData.map(h => (
          <View key={h.short} style={[styles.legendItem, { marginRight: 14 }]}>
            <View style={[styles.dot, { backgroundColor: h.color }]} />
            <Text style={styles.legendTxt}>{h.short}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Grouped bar chart */}
      <View style={{ marginLeft: 28 }}>
        <GroupedBarChart />
      </View>

      {/* Best deal banner */}
      <LinearGradient colors={['#0d665c', '#11998e']} style={styles.dealBanner}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Ionicons name="pricetag" size={15} color="#FFD700" />
        <Text style={styles.dealTxt}>Best deal: Bloom on Booking.com · $92/night</Text>
      </LinearGradient>

      {/* Top 2 hotels — individual booking cards */}
      {priceData.slice(0, 2).map((h, hi) => (
        <Animated.View key={h.short} style={styles.priceCard} entering={FadeInUp.delay(200 + hi * 140)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <View style={[styles.dot, { backgroundColor: h.color }]} />
            <Text style={styles.priceCardTitle}>{h.short} Hotel</Text>
          </View>
          <View style={styles.priceGrid}>
            {PLATFORMS.map((plat, pi) => (
              <Animated.View key={plat} style={styles.priceItem}
                entering={ZoomIn.delay(300 + hi * 140 + pi * 70)}>
                <Text style={styles.platLabel}>{plat}</Text>
                <Text style={styles.platPrice}>${h.prices[pi]}</Text>
                <AnimatedTouchable style={[styles.bookBtn, bookBtnStyle]}
                  onPress={() => {
                    bookScale.value = withSequence(withTiming(0.93, { duration: 90 }), withSpring(1));
                  }}
                  activeOpacity={0.9}>
                  <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.bookGrad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.bookTxt}>Book</Text>
                    <Ionicons name="open-outline" size={13} color="#fff" />
                  </LinearGradient>
                </AnimatedTouchable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );

  // ── Trends ──────────────────────────────────────────────────────────────────
  const renderTrends = () => (
    <Animated.View style={styles.card} entering={FadeIn.duration(300)} layout={Layout}>
      <Text style={styles.cardTitle}>7-DAY PRICE TRENDS</Text>
      <Text style={styles.cardSub}>Daily rate changes — toggle hotels to focus</Text>
      <HotelToggle visible={visible} onToggle={toggleHotel} />
      <View style={{ marginLeft: 28 }}>
        <PriceTrendChart visible={visible} />
      </View>

      {/* Price movement summary */}
      <Text style={[styles.cardTitle, { marginTop: 24, marginBottom: 12 }]}>PRICE MOVEMENT (7 DAYS)</Text>
      {priceHistory.map((h, i) => {
        const change = h.data[6] - h.data[0];
        const pct    = ((Math.abs(change) / h.data[0]) * 100).toFixed(1);
        const down   = change <= 0;
        return (
          <Animated.View key={h.short} style={styles.trendRow} entering={SlideInRight.delay(i * 80)}>
            <View style={[styles.dot, { backgroundColor: h.color }]} />
            <Text style={styles.trendName}>{h.short}</Text>
            <Text style={[styles.trendPct, { color: down ? '#10B981' : '#EF4444' }]}>
              {down ? '↓' : '↑'} {pct}%
            </Text>
            <Text style={styles.trendCur}>${h.data[6]}/night</Text>
          </Animated.View>
        );
      })}
    </Animated.View>
  );

  // ── Matrix ──────────────────────────────────────────────────────────────────
  const renderMatrix = () => (
    <Animated.View style={styles.card} entering={FadeIn.duration(300)} layout={Layout}>
      <Text style={styles.cardTitle}>AMENITY SCORE HEATMAP</Text>
      <Text style={styles.cardSub}>Green = excellent · Red = needs improvement</Text>
      <HeatmapMatrix />

      {/* Value Index */}
      <Text style={[styles.cardTitle, { marginTop: 24, marginBottom: 4 }]}>VALUE INDEX</Text>
      <Text style={[styles.cardSub, { marginBottom: 14 }]}>Score ÷ price — higher = better value for money</Text>
      {hotels.map((h, i) => {
        const vi  = +(h.score / h.price).toFixed(2);
        const max = 1.2;
        return (
          <Animated.View key={h.id} style={styles.valueRow} entering={SlideInRight.delay(i * 90)}>
            <View style={[styles.dot, { backgroundColor: h.color }]} />
            <Text style={styles.valueName}>{h.short}</Text>
            <View style={styles.valueTrack}>
              <Animated.View
                style={[styles.valueFill, {
                  width: `${Math.min(100, (vi / max) * 100)}%`,
                  backgroundColor: h.color + 'BB',
                }]}
                entering={FadeIn.delay(300 + i * 90)}
              />
            </View>
            <Text style={[styles.valueScore, { color: h.color }]}>{vi}</Text>
          </Animated.View>
        );
      })}
    </Animated.View>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#11998e', '#38ef7d']}
        style={[styles.headerGrad, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Animated.View style={styles.header} entering={FadeInDown.springify()}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BlurView intensity={30} style={styles.backBtnBlur}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hotel Comparison</Text>
          <View style={{ width: 45 }} />
        </Animated.View>
      </LinearGradient>

      {/* Tab Bar — 5 tabs, fixed width, no scrolling */}
      <Animated.View style={styles.tabWrap} entering={FadeInUp.delay(200).springify()}>
        <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={styles.tabBtn} onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabTxt, activeTab === i && styles.tabTxtActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        {activeTab === 0 && renderOverview()}
        {activeTab === 1 && renderScores()}
        {activeTab === 2 && renderPrices()}
        {activeTab === 3 && renderTrends()}
        {activeTab === 4 && renderMatrix()}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0f0c29' },
  headerGrad:     { paddingBottom: 20 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backBtn:        { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  backBtnBlur:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle:    { fontSize: 20, fontWeight: '700', color: '#fff' },

  // Tab bar
  tabWrap:        {
    flexDirection: 'row', position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 20, marginTop: -10,
    borderRadius: 15, padding: 5,
  },
  tabIndicator:   {
    position: 'absolute', left: 5, top: 5, bottom: 5,
    width: TAB_WIDTH, backgroundColor: '#10B981', borderRadius: 11,
  },
  tabBtn:         { width: TAB_WIDTH, paddingVertical: 11, alignItems: 'center', zIndex: 1 },
  tabTxt:         { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  tabTxtActive:   { color: '#fff' },

  scroll:         { flex: 1 },
  scrollContent:  { padding: 20 },

  // Best card
  bestCard:       { borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  bestGrad:       { padding: 20 },
  bestHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  bestLabel:      { fontSize: 14, color: '#FFD700', fontWeight: '600' },
  bestTitle:      { fontSize: 21, fontWeight: '800', color: '#fff', marginBottom: 8 },
  bestDesc:       { fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 21, marginBottom: 14 },
  bestFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  tag:            { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  tagTxt:         { color: '#fff', fontSize: 12, fontWeight: '600' },
  compositeVal:   { fontSize: 36, fontWeight: '800', color: '#fff' },
  compositeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },

  // Section card
  card:           { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, marginBottom: 20 },
  cardTitle:      { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 0.4, marginBottom: 3 },
  cardSub:        { fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 14 },

  // Hotel toggle chips
  chip:           { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, marginRight: 8 },
  chipDot:        { width: 7, height: 7, borderRadius: 4 },
  chipText:       { fontSize: 11, fontWeight: '600' },

  // Overall score bars
  barChart:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 195, paddingTop: 20 },
  barCol:         { alignItems: 'center', flex: 1 },
  bar:            { width: 26, borderRadius: 5, marginBottom: 6 },
  barScore:       { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', marginBottom: 3 },
  barLabel:       { fontSize: 9, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },

  // Sentiment
  sentRow:        { marginBottom: 13 },
  sentHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sentName:       { flex: 1, fontSize: 12, fontWeight: '600', color: '#fff' },
  sentCount:      { fontSize: 11, color: 'rgba(255,255,255,0.38)' },
  sentBar:        { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  sentSeg:        { height: '100%' },

  // Legend
  legendRow:      { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendTxt:      { fontSize: 11, color: 'rgba(255,255,255,0.55)' },

  // Shared dot
  dot:            { width: 9, height: 9, borderRadius: 5 },

  // Score table
  tableRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  nameCell:       { width: 86, flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameTxt:        { fontSize: 12, fontWeight: '600', color: '#fff' },
  scoreCell:      { width: 66, alignItems: 'center' },
  scoreHdr:       { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  scoreBadge:     { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
  scoreTxt:       { fontSize: 13, fontWeight: '700' },

  // Chart axes
  axisLabel:      { flex: 1, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.42)' },

  // Best deal banner
  dealBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 11, marginVertical: 16 },
  dealTxt:        { fontSize: 12, color: '#fff', fontWeight: '600', flex: 1 },

  // Price cards
  priceCard:      { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  priceCardTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  priceGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  priceItem:      { width: (width - 87) / 2, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 11, padding: 11 },
  platLabel:      { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4 },
  platPrice:      { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 9 },
  bookBtn:        { borderRadius: 9, overflow: 'hidden' },
  bookGrad:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, gap: 5 },
  bookTxt:        { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Trends
  trendRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  trendName:      { flex: 1, fontSize: 13, fontWeight: '600', color: '#fff' },
  trendPct:       { fontSize: 13, fontWeight: '700', minWidth: 54 },
  trendCur:       { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },

  // Heatmap
  heatHdr:        { fontSize: 9, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
  heatRowLbl:     { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  heatCell:       { height: HEAT_CELL_H, borderRadius: 6, justifyContent: 'center', alignItems: 'center', margin: 2 },
  heatVal:        { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Value index
  valueRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 11 },
  valueName:      { fontSize: 11, fontWeight: '600', color: '#fff', width: 44 },
  valueTrack:     { flex: 1, height: 15, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' },
  valueFill:      { height: 15, borderRadius: 8 },
  valueScore:     { fontSize: 12, fontWeight: '700', width: 34, textAlign: 'right' },
});
