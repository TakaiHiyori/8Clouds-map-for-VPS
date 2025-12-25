マークダウン表記
```bash
# memory info
free -h
```

```で挟むとその言語の色になる

#も見出しになるので便利

そもそもファイルの拡張子をmdにしておくべき
あと、vs codeの右下に「{} プレーンテキスト」というボタンがあるが、これを「Markdown」に変更すると、
画面右上のボタンからマークダウン形式でのプレビューが見れる



##CLIコマンド例

https://qiita.com/arene-calix/items/41d8d4ba572f1d652727

コマンド名	何ができる?	コマンド名は何に由来している?
pwd	今いるディレクトリの絶対パスを表示	print working directory
ls	ファイルやディレクトリを表示	list
tree	ディレクトリ構造を表示	directory tree

cd	階層移動(カレントディレクトリの変更)	change directory
mkdir	ディレクトリの作成	make directory
touch	ファイルの作成、タイムスタンプ更新	??
mv	ファイルやディレクトリの移動	move
cp	ファイルやディレクトリの移動	copy
rm	ファイルの削除	remove
tar	ファイルの圧縮、展開(tar形式)	tape archives

----
bashにはパイプ(|)と呼ばれる構文がある
コマンドA | コマンドB | コマンドCと書いたら、次の動きとなる
コマンドAは処理結果(文字列A)を標準出力に出す
コマンドBは標準入力から文字列Aを受け取り、処理結果(文字列B)を標準出力に出す
コマンドCは標準入力から文字列Bを受け取り、処理結果(文字列C)を標準出力に出す
コマンドA、B、Cのような、標準入力から文字列をinputして
標準出力へ文字列をoutputするコマンドを「フィルタコマンド」という
フィルタコマンドを使って文字列を加工することを「テキスト処理」という
また、パイプ等を駆使してコマンド1行でいろんな処理をすることを俗に「ワンライナー」という
----

cat	ファイル内容を結合して出力	concatenate(結合)
wc	単語数、行数を数える	word count
head	先頭からn行を出力	head(先頭)
tail	末尾からn行を出力	tail(末尾)
sort	行単位でソート	sort
uniq	重複を排除	unique
grep	テキスト検索	global regular expression print
sed	文字列置換	stream editor
awk	unix伝統のプログラム言語	開発者3名の頭文字
xargs	標準入力をコマンドライン引数に変換	execute arguments?
less	標準入力をエディタっぽく表示	less is more(moreコマンドの上位互換)
>, >>(リダイレクト)	標準入力をファイルに書き出す

apt, yum	コマンドのインストール	Advanced Package Tool, Yellowdog Updater Modified
sudo	ルート権限でコマンドを実行	superuser do(substitute user do)
su	ユーザ切り替え	substitute user
echo	文字列の表示	echo
env	環境変数の表示	environment
which, whereis	コマンドの場所を探す	which, where is
source, .	設定の反映(ファイル内容を現在のシェルで実行)	source
chmod	ファイル、ディレクトリのパーミッションを変更	change mode
chown	ファイル、ディレクトリの所有者を変更	change owner
systemctl	サービスの起動、停止など	system control

## 階層移動とファイル操作

|コマンド名|何ができる?|コマンド名は何に由来している?|
|---|---|---|
|cd|階層移動(カレントディレクトリの変更)|change directory|
|mkdir|ディレクトリの作成|make directory|
|touch|ファイルの作成、タイムスタンプ更新|??|
|mv|ファイルやディレクトリの移動|move|
|cp|ファイルやディレクトリの移動|copy|
|rm|ファイルの削除|remove|
|tar|ファイルの圧縮、展開(tar形式)|tape archives(←はじめて知った)|

---------------
# `curl -fsSL`の意味

Dockerfileを読んでいたときに遭遇したので、自分用のメモとして残します。

## -f, --fail
（HTTP）サーバーエラーでサイレントに失敗します（出力はまったくありません）。
これは主に、失敗した試行をより適切に処理するためにスクリプトなどを有効にするために行われます。
通常、HTTPサーバーがドキュメントの配信に失敗すると、そのことを示すHTMLドキュメントが返されます（多くの場合、理由なども説明されています）。
このフラグは、curlがそれを出力するのを防ぎ、エラー22を返します。
この方法はフェイルセーフではなく、特に認証が含まれる場合（応答コード401および407）、失敗した応答コードがすり抜ける場合があります。

## -s, --silent
サイレントモード。 プログレスメーターやエラーメッセージを表示しません。 カールをミュートにします。

## -S, --show-error
-sとともに使用すると、失敗した場合にcurlにエラーメッセージが表示されます。

## -L, --location
（HTTP / HTTPS）要求されたページが別の場所（Location：ヘッダーと3XX応答コードで示される）に移動したことをサーバーが報告した場合、このオプションはcurlに新しい場所で要求をやり直させます。

## まとめ
- HTTPリクエストがサーバーのエラーにより失敗した時に22というEXIT CODEを返す。
- 進行の状況を表示せず、エラーメッセージは表示する。
- アクセスしたページが移動していた場合、もう１度移動先にリクエストを送る。

-------
#「-h」の意味

コマンド「-h」は、ヘルプ（Help）を表示するか、人間に読みやすい形式（Human-readable）で表示するために使われます。どの意味で使われるかはコマンドによって異なり、例として df -h はディスクの空き容量を人間が読みやすい単位（KB, MB, GB）で表示し、多くのコマンドで -h は「ヘルプメッセージを表示する」オプションとして使われます
------

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
意味
curl -fsSL https://deb.nodesource.com/setup_20.x
→ curl でスクリプトを取得（標準出力に吐く）

| sudo -E bash -
→ その標準出力を bash に渡して、sudo（管理者権限）で実行

-f : HTTPエラーのとき失敗として終了（22 の終了コードなど）
-s : silent（進行状況を表示しない）
-S : -s と一緒のときだけ、エラーは表示
-L : リダイレクトされたら追いかける
→ 「エラーのときは静かに失敗しつつ、必要ならエラーは見える／リダイレクトも自動で追う」という、安全寄りのダウンロード方法。

| sudo -E bash - の意味
パイプ（|）で、左側の出力を右側の標準入力に渡しています。
sudo
後ろのコマンドを「管理者権限（root）」で実行
-E
呼び出し元の環境変数を引き継ぐ（http_proxy などが必要な環境向け）
bash
Bashシェルでスクリプトを実行
-（最後のハイフン）
「実行するスクリプトはファイルじゃなくて標準入力から受け取る」という意味
---------------------

npm install -g <package>
-g = global（グローバルインストール）
システム全体（/usr/local/lib/... など）にインストールして、
どのディレクトリからも ts-node などのコマンドとして使えるようにする
----------

よく出てくる -p の例
1. mkdir -p
「親ディレクトリもまとめて作る」
例: mkdir -p /opt/kanban-server/logs
/opt がなくても /opt/kanban-server/logs まで全部作る
すでに存在していてもエラーにしない
--------------------
