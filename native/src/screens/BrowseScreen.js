import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { sb, PUBLIC_VIEW } from '../supabase';
import { theme } from '../theme';
import { t } from '../i18n';
import ListItem from '../components/ListItem';

export default function BrowseScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    const { data: rows, error } = await sb
      .from(PUBLIC_VIEW)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = (lot) => navigation.navigate('Detail', { lotId: lot.id });

  const filtered = q
    ? data.filter((l) =>
        `${l.title_en} ${l.title_cn} ${l.cat} ${l.belt}`.toLowerCase().includes(q.toLowerCase())
      )
    : data;

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.search}
        placeholder={t('searchPlaceholder')}
        value={q}
        onChangeText={setQ}
        placeholderTextColor={theme.muted}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListItem lot={item} onPress={() => openDetail(item)} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? '' : '—'}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.bg, paddingTop: 8 },
  search: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 12, marginBottom: 6, color: theme.ink,
  },
  empty: { textAlign: 'center', color: theme.muted, marginTop: 30 },
});
