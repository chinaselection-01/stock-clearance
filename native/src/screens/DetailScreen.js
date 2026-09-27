import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { sb, PUBLIC_VIEW } from '../supabase';
import { theme } from '../theme';
import { t } from '../i18n';

function titleOf(l) { return l.title_en || l.title_cn || '—'; }

export default function DetailScreen({ route }) {
  const { lotId } = route.params;
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await sb.from(PUBLIC_VIEW).select('*').eq('id', lotId).single();
      if (!error) setLot(data);
      setLoading(false);
    })();
  }, [lotId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email) return;
    setSending(true);
    const { error } = await sb.from('inquiries').insert({
      lot_id: lotId,
      lot_title: titleOf(lot),
      name: form.name,
      email: form.email,
      whatsapp: form.whatsapp || null,
      qty: null,
      message: form.message || null,
      status: 'new',
    });
    setSending(false);
    if (!error) setDone(true);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={theme.brand} /></View>;
  if (!lot) return <View style={styles.center}><Text style={{ color: theme.muted }}>—</Text></View>;

  return (
    <ScrollView style={styles.wrap}>
      {lot.img ? (
        <Image source={{ uri: lot.img }} style={styles.img} resizeMode="cover" />
      ) : (
        <View style={[styles.img, styles.imgEmpty]}><Text style={{ fontSize: 48 }}>📦</Text></View>
      )}
      <View style={styles.body}>
        <Text style={styles.title}>{titleOf(lot)}</Text>
        <Text style={styles.price}>${lot.price_now}{lot.price_was ? <Text style={styles.was}>  ${lot.price_was}</Text> : null}</Text>
        <Row label={t('qty')} value={`${lot.qty} ${lot.unit || t('unit')}`} />
        {lot.moq ? <Row label={t('moq')} value={lot.moq} /> : null}
        {lot.cond ? <Row label={t('cond')} value={lot.cond} /> : null}
        {lot.brand ? <Row label={t('brand')} value={lot.brand} /> : null}
        {lot.belt ? <Row label="Belt" value={lot.belt} /> : null}
        {(lot.desc_en || lot.desc_cn) ? (
          <Text style={styles.desc}>{lot.desc_en || lot.desc_cn}</Text>
        ) : null}

        {done ? (
          <View style={styles.okBox}><Text style={styles.okTxt}>{t('inquirySent')}</Text></View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{t('sendInquiry')}</Text>
            <Field placeholder={t('yourName')} value={form.name} onChange={(v) => set('name', v)} />
            <Field placeholder={t('yourEmail')} value={form.email} onChange={(v) => set('email', v)} />
            <Field placeholder={t('whatsapp')} value={form.whatsapp} onChange={(v) => set('whatsapp', v)} />
            <Field placeholder={t('message')} value={form.message} onChange={(v) => set('message', v)} multiline />
            <TouchableOpacity
              style={[styles.btn, (!form.name || !form.email || sending) && styles.btnDisabled]}
              onPress={submit} disabled={!form.name || !form.email || sending}
            >
              <Text style={styles.btnTxt}>{sending ? '…' : t('submit')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Field({ placeholder, value, onChange, multiline }) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      placeholderTextColor={theme.muted}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  img: { width: '100%', height: 240, backgroundColor: theme.bg },
  imgEmpty: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: theme.ink },
  price: { fontSize: 22, fontWeight: '800', color: theme.accent, marginTop: 6 },
  was: { fontSize: 14, color: theme.muted, textDecorationLine: 'line-through' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.line },
  rowLabel: { color: theme.muted, fontSize: 14 },
  rowValue: { color: theme.ink, fontSize: 14, fontWeight: '600' },
  desc: { fontSize: 14, color: theme.ink, marginTop: 12, lineHeight: 20 },
  form: { marginTop: 20, backgroundColor: theme.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.line },
  formTitle: { fontSize: 16, fontWeight: '700', color: theme.ink, marginBottom: 10 },
  input: { backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 10, color: theme.ink },
  inputMultiline: { height: 70, textAlignVertical: 'top' },
  btn: { backgroundColor: theme.brand, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  okBox: { marginTop: 20, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#BBF7D0' },
  okTxt: { color: theme.accent, fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
