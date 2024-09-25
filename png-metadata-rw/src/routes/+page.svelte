<script lang="ts">
import type { ActionData, PageData } from "./$types";

export let form: ActionData;
</script>


<div>
    <div>
        <h2>How to use</h2>
        <p>1:「ファイルを選択」ボタンをクリックし、PNGファイルをアップロードする</p>
        <p>2.1: PNGファイルのiTXtチャンクに文字列を埋め込みたい場合は「埋め込みたい文字列を入力」に埋め込みたい文字列を入力してから送信ボタンをクリック。</p>
        <p>2.2: PNGファイルのiTXtチャンクに埋め込まれた文字列を読み取りたい場合は空白のままクリック。</p>
        <p>3: 少し待つとPNGファイル(フォームに文字列を入力した場合はiTXtチャンクに文字列が埋め込まれた状態)と、iTXtチャンク内の文字列が出力されます。</p>
    </div>
    <form method="post" enctype="multipart/form-data">
        <div class="group">
            <label for="file">pngファイルをアップロード</label>
            <input
                type="file"
                name="fileToUpload"
                id="file"
                accept="image/png"
                required
            />
            <input
                type="text"
                name="text"
                id="text"
                placeholder="埋め込みたい文字列を入力"
            />
        </div>
        <button type="submit">送信</button>
    </form>
    {#if form?.success}
        {#if form.success=false}
            <p>{form.message}</p>
        {/if}
        {#if form.success=true}
            {#if form.embeddedText}
                <p>埋め込まれていたテキスト：{form.embeddedText}</p>
            {/if}
            {#if form?.downloadLink}
                <a href="{form.downloadLink}" download>
                    <button>
                        Download
                    </button>
                </a>
            {/if}
        {/if}
    {/if}
</div>