import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { t } from '../i18n';

function titleOf(l) {
  return l.title_en || l.title_cn || '—';
}

export default function ListItem({ lot, onPress }) {
  const img = lot.img;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {img ? (
        <Image source={{ uri: img }} style={styles.img} resizeMode="cover" />
      ) : (
        <View style={[styles.img, styles.imgEmpty]}>
          <Text style={styles.imgEmptyTxt}>📦</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{titleOf(lot)}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>${lot.price_now}</Text>
          <Text style={styles.qty}>{t('qty')}: {lot.qty} {lot.unit || t('unit')}</Text>
        </View>
        <View style={styles.tagRow}>
          {lot.cat ? <Text style={styles.tag}>{lot.cat}</Text> : null}
          {lot.belt ? <Text style={styles.tag}>{lot.belt}</Text> : null}
          {lot.cond ? <Text style={styles.tagMuted}>{lot.cond}</Text> : null}
        </View>
        {lot.moq ? (
          <Text style={styles.moq}>{t('moq')}: {lot.moq}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card, flexDirection: 'row', borderRadius: 12,
    padding: 10, marginHorizontal: 12, marginVertical: 6, borderWidth: 1, borderColor: theme.line,
  },
  img: { width: 84, height: 84, borderRadius: 10, backgroundColor: theme.bg },
  imgEmpty: { alignItems: 'center', justifyContent: 'center' },
  imgEmptyTxt: { fontSize: 28 },
  body: { flex: 1, marginLeft: 10 },
  title: { fontSize: 15, fontWeight: '700', color: theme.ink },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { fontSize: 16, fontWeight: '800', color: theme.accent },
  qty: { fontSize: 12, color: theme.muted },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  tag: { fontSize: 11, color: theme.brand, backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 6, marginBottom: 4 },
  tagMuted: { fontSize: 11, color: theme.muted, backgroundColor: theme.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 6, marginBottom: 4 },
  moq: { fontSize: 11, color: theme.muted, marginTop: 2 },
});
