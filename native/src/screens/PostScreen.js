import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sb, BUCKET } from '../supabase';
import { theme } from '../theme';
import { t } from '../i18n';

export default function PostScreen() {
  const [img, setImg] = useState(null);
  const [f, setF] = useState({
    title_en: '', cat: '', belt: '', qty: '', cond: '', price_was: '', price_now: '',
    supplier_name: '', whatsapp: '', desc_en: '',
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const pick = async (useCamera) => {
    const opt = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 };
    const res = useCamera
      ? await ImagePicker.launchCameraAsync(opt)
      : await ImagePicker.launchImageLibraryAsync(opt);
    if (!res.canceled && res.assets?.[0]) setImg(res.assets[0].uri);
  };

  const publish = async () => {
    if (!f.title_en || !f.qty || !f.price_now) {
      Alert.alert(t('appName'), 'Product name, quantity and clearance price are required.');
      return;
    }
    setBusy(true);
    let imgUrl = null;
    if (img) {
      try {
        const r = await fetch(img);
        const blob = await r.blob();
        const path = `${Date.now()}.jpg`;
        const { error: upErr } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
        if (!upErr) {
          const { data: u } = sb.storage.from(BUCKET).getPublicUrl(path);
          imgUrl = u.publicUrl;
        }
      } catch (e) { /* keep going without image */ }
    }
    const row = {
      title_en: f.title_en,
      title_cn: f.title_en,
      cat: f.cat || null, belt: f.belt || null,
      qty: Number(f.qty) || 0, unit: 'pcs',
      price_was: f.price_was ? Number(f.price_was) : null,
      price_now: Number(f.price_now), moq: 1, cond: f.cond || null,
      desc_en: f.desc_en || null, img: imgUrl,
      supplier_name: f.supplier_name || null,
      supplier_whatsapp: f.whatsapp || null,
      supplier_resp: 'platform',
    };
    const { data, error } = await sb.from('listings').insert(row).select('id').single();
    setBusy(false);
    if (!error && data) {
      const ids = JSON.parse(await AsyncStorage.getItem('sc_my_posts') || '[]');
      ids.push(data.id);
      await AsyncStorage.setItem('sc_my_posts', JSON.stringify(ids));
      setDone(true);
    } else {
      Alert.alert(t('appName'), error?.message || 'Publish failed.');
    }
  };

  if (done) {
    return (
      <View style={styles.center}>
        <Text style={styles.okTxt}>{t('published')}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => { setDone(false); setImg(null); setF({ title_en:'',cat:'',belt:'',qty:'',cond:'',price_was:'',price_now:'',supplier_name:'',whatsapp:'',desc_en:'' }); }}>
          <Text style={styles.btnTxt}>{t('postTitle')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap}>
      <Text style={styles.h1}>{t('postTitle')}</Text>
      <View style={styles.imgBox}>
        {img ? <Image source={{ uri: img }} style={styles.img} /> : <View style={[styles.img, styles.imgEmpty]}><Text style={{ fontSize: 40 }}>📷</Text></View>}
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btnHalf} onPress={() => pick(false)}><Text style={styles.btnTxt}>{t('pickPhoto')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnHalf} onPress={() => pick(true)}><Text style={styles.btnTxt}>{t('takePhoto')}</Text></TouchableOpacity>
      </View>

      <Field placeholder={t('productName')} value={f.title_en} onChange={(v) => set('title_en', v)} />
      <Field placeholder={t('category')} value={f.cat} onChange={(v) => set('cat', v)} />
      <Field placeholder={t('belt')} value={f.belt} onChange={(v) => set('belt', v)} />
      <Field placeholder={t('quantity')} value={f.qty} onChange={(v) => set('qty', v)} keyboardType="numeric" />
      <Field placeholder={t('condition')} value={f.cond} onChange={(v) => set('cond', v)} />
      <Field placeholder={t('priceWas')} value={f.price_was} onChange={(v) => set('price_was', v)} keyboardType="numeric" />
      <Field placeholder={t('priceNow')} value={f.price_now} onChange={(v) => set('price_now', v)} keyboardType="numeric" />
      <Field placeholder={t('yourNameSup')} value={f.supplier_name} onChange={(v) => set('supplier_name', v)} />
      <Field placeholder={t('yourWhatsapp')} value={f.whatsapp} onChange={(v) => set('whatsapp', v) } />
      <Field placeholder={t('message')} value={f.desc_en} onChange={(v) => set('desc_en', v)} multiline />

      <TouchableOpacity style={[styles.btn, busy && styles.btnDisabled]} onPress={publish} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>{t('publish')}</Text>}
      </TouchableOpacity>
      <Text style={styles.note}>{t('yourWhatsapp')}</Text>
    </ScrollView>
  );
}

function Field({ placeholder, value, onChange, multiline, keyboardType }) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.inputMulti]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboardType}
      placeholderTextColor={theme.muted}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.bg, padding: 14 },
  h1: { fontSize: 20, fontWeight: '800', color: theme.ink, marginBottom: 10 },
  imgBox: { alignItems: 'center', marginBottom: 10 },
  img: { width: 160, height: 160, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line },
  imgEmpty: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  btnHalf: { width: '48%', backgroundColor: theme.brand, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  input: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 11, marginBottom: 10, color: theme.ink },
  inputMulti: { height: 70, textAlignVertical: 'top' },
  btn: { backgroundColor: theme.accent, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  note: { color: theme.muted, fontSize: 12, marginTop: 10, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.bg },
  okTxt: { color: theme.accent, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
});
