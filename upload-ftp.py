#!/usr/bin/env python3
"""Upload NomadWay site to Hostinger via FTP"""

import ftplib
import os
from pathlib import Path
from typing import Callable

# Configurações FTP
FTP_HOST = "185.245.180.59"
FTP_USER = "u608840078"
FTP_PASS = "5676484aS@@"
FTP_BASE = "domains/nomadway.com.br/public_html"
LOCAL_BASE = "/Users/clowd/.openclaw/workspace/nomadway/out"

class FTPUploader:
    def __init__(self, host: str, user: str, password: str):
        self.ftp = ftplib.FTP(host)
        self.ftp.login(user, password)
        print(f"✅ Conectado ao FTP: {host}")

    def ensure_dir(self, dir_path: str):
        """Cria diretório se não existe"""

        try:
            self.ftp.mkd(dir_path)
            print(f"  📁 Criado: {dir_path}")
        except ftplib.error_perm as e:
            # Se retornar 550 significa que já existe
            if "550" in str(e):
                pass  # Diretório já existe, tudo bem
            else:
                raise

    def upload_path(self, local: Path, remote_base: str):
        """Upload recursivo de path para FTP"""

        if local.is_dir():
            self.upload_dir(local, remote_base)
        else:
            self.upload_file(local, remote_base)

    def upload_dir(self, local_dir: Path, remote_base: str):
        """Upload recursivo de diretório"""

        for item in local_dir.iterdir():
            rel_path = item.relative_to(LOCAL_BASE)
            remote_path = f"{remote_base}/{rel_path.as_posix()}"

            if item.is_dir():
                # Criar diretório remoto
                self.ensure_dir(remote_path)
                # Upload recursivamente
                self.upload_dir(item, remote_base)
            else:
                # Upload arquivo
                self.upload_file(item, remote_path)

    def upload_file(self, local_file: Path, remote_path: str):
        """Upload de arquivo único"""

        try:
            # Criar diretório pai se necessário
            parent_dir = str(Path(remote_path).parent)
            if parent_dir != FTP_BASE:
                self.ensure_dir(parent_dir)

            # Upload arquivo
            with open(local_file, 'rb') as f:
                self.ftp.storbinary(f'STOR {remote_path}', f)

            rel_path = str(local_file.relative_to(LOCAL_BASE))
            print(f"✅ {rel_path}")
            return True
        except Exception as e:
            rel_path = str(local_file.relative_to(LOCAL_BASE))
            print(f"❌ {rel_path}: {e}")
            return False

    def cleanup(self):
        """Fechar conexão FTP"""
        try:
            self.ftp.quit()
        except:
            pass

def main():
    print("🚀 Upload NomadWay → Hostinger")
    print("=" * 50)

    # Conectar FTP
    try:
        uploader = FTPUploader(FTP_HOST, FTP_USER, FTP_PASS)

        # Navegar para base remota
        uploader.ftp.cwd(FTP_BASE)
        print(f"📂 Diretório remoto: {FTP_BASE}")

        # Upload
        print("\n📦 Iniciando upload...")
        print("=" * 50)
        local_path = Path(LOCAL_BASE)
        uploader.upload_dir(local_path, FTP_BASE)

        print("\n" + "=" * 50)
        print("🎉 Upload concluído!")
        print(f"🌐 Acesse: https://nomadway.com.br")

        uploader.cleanup()

    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())