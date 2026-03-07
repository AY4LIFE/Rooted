import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { Text, useThemeColor } from '@/components/Themed';
import { FormattingToolbar } from './FormattingToolbar';
import { VerseChip } from './VerseChip';
import { parseVerseReferences } from '@/services/verseParser';

interface NoteEditorProps {
  title: string;
  content: string;
  eventName?: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onEventNameChange?: (eventName: string) => void;
  onVersePress: (parsed: { bookId: string; chapter: number; verseStart: number; verseEnd: number; raw: string }) => void;
}

function getEditorHTML(textColor: string, placeholderColor: string): string {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:transparent}
#editor{
  outline:none;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  font-size:17px;
  line-height:1.76;
  color:${textColor};
  padding:8px 0;
  min-height:100%;
  word-wrap:break-word;
  -webkit-user-select:text;
}
#editor:empty:before{
  content:attr(data-placeholder);
  color:${placeholderColor};
  pointer-events:none;
}
#editor b,#editor strong{font-weight:700}
#editor i,#editor em{font-style:italic}
#editor u{text-decoration:underline}
#editor ul,#editor ol{padding-left:24px;margin:4px 0}
#editor li{margin:2px 0}
</style>
</head><body>
<div id="editor" contenteditable="true" data-placeholder="Start writing your notes here... Type Bible references like John 3:16 to make them tappable."></div>
<script>
var editor=document.getElementById('editor');
var savedRange=null;

editor.addEventListener('blur',function(){
  var sel=window.getSelection();
  if(sel.rangeCount>0) savedRange=sel.getRangeAt(0).cloneRange();
});

function restoreSelection(){
  if(savedRange){
    var sel=window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }
}

function sendUpdate(){
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type:'update',
    html:editor.innerHTML,
    text:editor.innerText||editor.textContent||''
  }));
}

editor.addEventListener('input',sendUpdate);

function execCmd(command,value){
  editor.focus();
  restoreSelection();
  document.execCommand(command,false,value||null);
  sendUpdate();
}

function setHTML(html){
  editor.innerHTML=html||'';
}

function handleMessage(data){
  if(data.type==='format'){
    execCmd(data.command,data.value);
  }else if(data.type==='setContent'){
    setHTML(data.html);
    sendUpdate();
  }else if(data.type==='focus'){
    editor.focus();
  }
}

document.addEventListener('message',function(e){
  try{handleMessage(JSON.parse(e.data));}catch(err){}
});
window.addEventListener('message',function(e){
  try{handleMessage(JSON.parse(e.data));}catch(err){}
});
</script>
</body></html>`;
}

export function NoteEditor({
  title,
  content,
  eventName = '',
  onTitleChange,
  onContentChange,
  onEventNameChange,
  onVersePress,
}: NoteEditorProps) {
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const { height: windowHeight } = useWindowDimensions();

  const webViewRef = useRef<WebView>(null);
  const initialContentSet = useRef(false);

  const [plainText, setPlainText] = useState('');
  const [debouncedPlainText, setDebouncedPlainText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPlainText(plainText), 500);
    return () => clearTimeout(timer);
  }, [plainText]);

  const detectedVerses = useMemo(
    () => parseVerseReferences(debouncedPlainText),
    [debouncedPlainText]
  );

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'update') {
        onContentChange(data.html);
        setPlainText(data.text);
      }
    } catch {}
  }, [onContentChange]);

  const handleFormat = useCallback((command: string, value?: string) => {
    const msg = JSON.stringify({ type: 'format', command, value });
    webViewRef.current?.injectJavaScript(`handleMessage(${msg}); true;`);
  }, []);

  const handleWebViewLoad = useCallback(() => {
    if (!initialContentSet.current && content) {
      const html = content.includes('<') ? content : content.replace(/\n/g, '<br>');
      const escaped = JSON.stringify(html);
      webViewRef.current?.injectJavaScript(`setHTML(${escaped}); sendUpdate(); true;`);
      initialContentSet.current = true;
    }
  }, [content]);

  const htmlSource = useMemo(() => ({
    html: getEditorHTML(textColor, placeholderColor),
  }), [textColor, placeholderColor]);

  const keyboardOffset = Platform.OS === 'ios' ? Math.min(windowHeight * 0.12, 100) : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
    >
      {/* Header section: Title, Event, Verses, Toolbar */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TextInput
          style={[styles.titleInput, { color: textColor, borderBottomColor: borderColor }]}
          placeholder="Title"
          placeholderTextColor={placeholderColor}
          value={title}
          onChangeText={onTitleChange}
        />

        {onEventNameChange && (
          <TextInput
            style={[styles.eventInput, { color: textColor, borderBottomColor: borderColor }]}
            placeholder="Event / Service name"
            placeholderTextColor={placeholderColor}
            value={eventName}
            onChangeText={onEventNameChange}
          />
        )}

        {detectedVerses.length > 0 && (
          <View style={styles.verseSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.verseBarContent}
              keyboardShouldPersistTaps="always"
            >
              {detectedVerses.map(({ parsed }, index) => (
                <VerseChip
                  key={parsed.raw + index}
                  parsed={parsed}
                  onPress={(p) =>
                    onVersePress({
                      bookId: p.bookId,
                      chapter: p.chapter,
                      verseStart: p.verseStart,
                      verseEnd: p.verseEnd,
                      raw: p.raw,
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.toolbarWrap}>
          <FormattingToolbar onFormat={handleFormat} />
        </View>
      </View>

      {/* Content: WebView rich text editor */}
      <WebView
        ref={webViewRef}
        source={htmlSource}
        onMessage={handleWebViewMessage}
        onLoadEnd={handleWebViewLoad}
        style={styles.webView}
        originWhitelist={['*']}
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView
        scrollEnabled
        showsVerticalScrollIndicator={false}
        contentMode="mobile"
        javaScriptEnabled
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    marginBottom: 6,
  },
  eventInput: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
    opacity: 0.8,
  },
  verseSection: {
    marginTop: 10,
    marginBottom: 6,
  },
  verseBarContent: {
    alignItems: 'center',
    paddingRight: 8,
  },
  toolbarWrap: {
    marginVertical: 10,
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
