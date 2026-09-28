import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { sb, PUBLIC_VIEW } from '../supabase';
import { theme } from '../theme';
import { t } from '../i18n';
import { useLang } from '../../App';
import ListItem from '../components/ListItem';

const POPULAR = [
  'overstock', 'liquidation', 'clearance', 'stock lots',
  'clothing', 'electronics', 'home', 'pet', 'toy', 'shoes',
];

export default function HomeScreen({ navigation }) {
  const { lang } = useLang();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    const { data: rows, error } = await sb
      .from(PUBLIC_VIEW)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60);
    if (!error) setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = (lot) => navigation.navigate('Browse', { screen: 'Detail', params: { lotId: lot.id } });

  const filtered = q
    ? data.filter((l) =>
        `${l.title_en} ${l.title_cn} ${l.cat} ${l.belt}`.toLowerCase().includes(q.toLowerCase())
      )
    : data;

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>{t('appName')}</Text>
      <TextInput
        style={styles.search}
        placeholder={t('searchPlaceholder')}
        value={q}
        onChangeText={setQ}
        placeholderTextColor={theme.muted}
      />
      {!q && (
        <View style={styles.popBox}>
          <Text style={styles.popTitle}>{t('popular')}</Text>
          <View style={styles.chips}>
            {POPULAR.map((p) => (
              <TouchableOpacity key={p} style={styles.chip} onPress={() => setQ(p)}>
                <Text style={styles.chipTxt}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <Text style={styles.subTitle}>{t('allStock')}</Text>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListItem lot={item} onPress={() => openDetail(item)} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? '' : '—'}</Text>}
      />
      <View style={styles.footBox}>
        <Text style={styles.footText}>{t('appName')} · Global B2B stock-lot & clearance marketplace</Text>
        <Text style={styles.footEmail}>{t('contactEmail')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.bg, paddingTop: 10 },
  h1: { fontSize: 22, fontWeight: '800', color: theme.ink, marginHorizontal: 12, marginBottom: 8 },
  search: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 12, marginBottom: 10, color: theme.ink,
  },
  popBox: { marginHorizontal: 12, marginBottom: 8 },
  popTitle: { fontSize: 13, fontWeight: '700', color: theme.muted, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: '#EFF6FF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  chipTxt: { color: theme.brand, fontSize: 12, fontWeight: '600' },
  subTitle: { fontSize: 14, fontWeight: '700', color: theme.ink, marginHorizontal: 12, marginBottom: 4 },
  empty: { textAlign: 'center', color: theme.muted, marginTop: 30 },
  footBox: { paddingVertical: 22, borderTopWidth: 1, borderTopColor: theme.line, marginTop: 16, alignItems: 'center' },
  footText: { fontSize: 11, color: theme.muted, textAlign: 'center', marginBottom: 4 },
  footEmail: { fontSize: 12, color: theme.brand, fontWeight: '600', textAlign: 'center' },
});
