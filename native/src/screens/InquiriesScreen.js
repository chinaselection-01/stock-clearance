import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sb } from '../supabase';
import { theme } from '../theme';
import { t } from '../i18n';

export default function InquiriesScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const ids = JSON.parse(await AsyncStorage.getItem('sc_my_posts') || '[]');
    if (ids.length === 0) { setItems([]); setLoading(false); return; }
    const { data, error } = await sb
      .from('inquiries')
      .select('*')
      .in('lot_id', ids)
      .order('created_at', { ascending: false });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>{t('myInquiries')}</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          loading ? <ActivityIndicator color={theme.brand} style={{ marginTop: 30 }} />
            : <Text style={styles.empty}>{t('noInquiries')}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.lot}>{item.lot_title}</Text>
            <Text style={styles.name}>{item.name} · {item.email}</Text>
            {item.whatsapp ? <Text style={styles.sub}>WhatsApp: {item.whatsapp}</Text> : null}
            {item.message ? <Text style={styles.msg}>{item.message}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.bg, paddingTop: 10 },
  h1: { fontSize: 18, fontWeight: '800', color: theme.ink, marginHorizontal: 14, marginBottom: 8 },
  card: { backgroundColor: theme.card, borderRadius: 12, padding: 14, marginHorizontal: 14, marginVertical: 6, borderWidth: 1, borderColor: theme.line },
  lot: { fontSize: 15, fontWeight: '700', color: theme.ink },
  name: { fontSize: 13, color: theme.brand, marginTop: 4 },
  sub: { fontSize: 12, color: theme.muted, marginTop: 2 },
  msg: { fontSize: 13, color: theme.ink, marginTop: 6, lineHeight: 18 },
  empty: { textAlign: 'center', color: theme.muted, marginTop: 30, marginHorizontal: 24 },
});
