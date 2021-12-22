// monsterkodi/kode 0.184.0

var _k_

var exports, slash

slash = require('kslash')
exports = {}
exports.name = {Makefile:'\uf423',LICENSE:'\uf495',license:'\uf495'}
exports.ext = {apk:'',avi:'',avro:'',awk:'',bash:'',bash_history:'',bash_profile:'',bashrc:'',bat:'',bmp:'',c:'',cc:'',cfg:'',clj:'',cljs:'',cls:'',coffee:'',conf:'',cp:'',cpp:'',csh:'',css:'',csv:'',cxx:'',d:'',dart:'',db:'',diff:'',doc:'',docx:'',ds_store:'',dump:'',ebook:'',editorconfig:'',ejs:'',env:'',eot:'',epub:'',erb:'',erl:'',exe:'',fish:'',flac:'',flv:'',font:'',gdoc:'',gemfile:'',gemspec:'',gform:'',gif:'',git:'',gitconfig:'',github:'',gitignore:'',go:'',gradle:'',gsheet:'',gslides:'',guardfile:'',gz:'',h:'',hbs:'',hpp:'',hs:'',htm:'',html:'',hxx:'',ico:'',image:'',iml:'',ini:'',ipynb:'',jar:'',java:'',jpeg:'',jpg:'',js:'',json:'',jsx:'',koffee:'',ksh:'',less:'',lhs:'',localized:'',DS_Store:'',lock:'',log:'',lua:'',m4a:'',markdown:'',map:'\uf278',md:'',mkd:'',mkv:'',mobi:'',mov:'',mp3:'',mp4:'',mustache:'',noon:'\uf444',npmignore:'',ogg:'',ogv:'',otf:'',pdf:'',php:'',pl:'',png:'',icns:'',ppt:'',pptx:'',procfile:'',properties:'',ps1:'',psd:'',pxm:'',py:'',pyc:'',r:'',rakefile:'',rar:'',rb:'',rdata:'',rdb:'',rdoc:'',rds:'',rlib:'',rmd:'',rs:'',rspec:'',rspec_parallel:'',rspec_status:'',rss:'',ru:'',rubydoc:'',sass:'',scala:'',scss:'',sh:'',shell:'',slim:'',sql:'',sqlite3:'',styl:'\ue759',stylus:'',svg:'',swift:'',tar:'',tex:'',tiff:'',ts:'',tsx:'',ttf:'',twig:'',txt:'',video:'',vim:'',vue:'﵂',wav:'',webm:'',webp:'',windows:'',woff:'',woff2:'',xls:'',xlsx:'',xml:'',xul:'',yaml:'',yml:'',zip:'',tgz:'',bz2:'',pkg:'\uf8d6',dmg:'\uf7c9',xpi:'\uf492',zsh:'',zshrc:'',entitlements:'\uf495',plist:'\uf779',pbxproj:'\ue711',xcworkspacedata:'\ue711',xcuserstate:'\ue711',xcscheme:'\ue711',xcbkptlist:'\ue711',xib:'\ue711',sln:'\ue70f',vcxproj:'\ue70f',user:'\ue70f',woff:'\uf031',pug:'\ue759',iss:'\ue615',toml:'\ue615',vbs:'\ue008',asar:'\uf8d6',bin:'\uf8d6',dat:'\uf8d6',dll:'\uf8d6',exp:'\uf8d6',iobj:'\uf8d6',ipdb:'\uf8d6',idb:'\uf8d6',ilk:'\uf8d6',lib:'\uf8d6',obj:'\uf8d6',pak:'\uf8d6',pdb:'\uf8d6',tlog:'\uf8d6'}

exports.get = function (name, ext)
{
    var _232_21_, _232_42_

    return ((_232_21_=exports.ext[ext]) != null ? _232_21_ : ((_232_42_=exports.name[name]) != null ? _232_42_ : exports.ext[slash.ext(ext)]))
}
module.exports = exports