<script>
    import { onMount } from 'svelte';
    let input_text = '';
    let uploaded_png;

    $: if (uploaded_png) {
        console.log(uploaded_png)

        for (const file of uploaded_png) {
        console.log('${file.name}: ${file.size} bytes');
        }
    }

    // フォームに入力したテキストとアップロードしたpngファイルを+server.tsに送信関数
    async function handle_input_text(event) {
        event.preventDefault();

        if (!uploaded_png || uploaded_png.length === 0) {
            alert('pngファイルをアップロードしてください');
            return;
        }

        const formData = new FormData();
        formData.append('text', input_text);
        formData.append('png', uploaded_png);

        const response = await fetch('/', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        console.log(result);
    }
</script>


<div>
    <div>
        <h2>How to use</h2>
        <p>1:「ファイルを選択」ボタンをクリックし、PNGファイルをアップロードする</p>
        <p>2.1: PNGファイルのiTXtチャンクに文字列を埋め込みたい場合は「埋め込みたい文字列を入力」に埋め込みたい文字列を入力してから送信ボタンをクリック。</p>
        <p>2.2: PNGファイルのiTXtチャンクに埋め込まれた文字列を読み取りたい場合は空白のままクリック。</p>
        <p>3: 少し待つとPNGファイル(フォームに文字列を入力した場合はiTXtチャンクに文字列が埋め込まれた状態)と、iTXtチャンク内の文字列が出力されます。</p>
    </div>
    <form on:submit={handle_input_text}>
        <input type="text" bind:value={input_text} placeholder="埋め込みたい文字列を入力" />
        <input type="file" accept="image/png" bind:files={uploaded_png}/>
        <button type="submit">送信</button>
        {#if uploaded_png}
            <p>Uploaded file:{uploaded_png.name} {uploaded_png.size} bytes</p>
        {/if}
    </form>
    <div>
        <p>埋め込まれていたテキスト</p>
    </div>
</div>