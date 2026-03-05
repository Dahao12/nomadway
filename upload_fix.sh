#!/bin/bash
lftp -u u608840078,5676484aS@@ 185.245.180.59 << 'ENDLFTP'
set ssl:verify-certificate no
cd /public_html
put out/index.html
bye
ENDLFTP
