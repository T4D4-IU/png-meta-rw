<script lang="ts">
import { enhance } from "$app/forms";
import { onMount } from "svelte";


</script>


<div>
    <div>
        <h2>How to use</h2>
        <p>1:「ファイルを選択」ボタンをクリックし、PNGファイルをアップロードする</p>
        <p>2.1: PNGファイルのiTXtチャンクに文字列を埋め込みたい場合は「埋め込みたい文字列を入力」に埋め込みたい文字列を入力してから送信ボタンをクリック。</p>
        <p>2.2: PNGファイルのiTXtチャンクに埋め込まれた文字列を読み取りたい場合は空白のままクリック。</p>
        <p>3: 少し待つとPNGファイル(フォームに文字列を入力した場合はiTXtチャンクに文字列が埋め込まれた状態)と、iTXtチャンク内の文字列が出力されます。</p>
    </div>
    <form method="post" use:enhance enctype="multipart/form-data">
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
    <div>
        <p>埋め込まれていたテキスト</p>
    </div>
</div>