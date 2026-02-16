#!/usr/bin/env python3
import ftplib
import os
import sys

# Configurações FTP
FTP_HOST = "185.245.180.59"
FTP_USER = "u608840078"
FTP_PASS = "5676484aS@@"
FTP_PATH = "public_html"
LOCAL_PATH = "out"

def upload_directory(ftp, local_dir, remote_dir):
    """Upload directory recursively"""
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isfile(local_path):
            print(f"Uploading: {item}")
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)
        elif os.path.isdir(local_path):
            print(f"Creating dir: {item}")
            try:
                ftp.mkd(remote_path)
            except ftplib.error_perm:
                pass  # Directory already exists
            upload_directory(ftp, local_path, remote_path)

def main():
    print(f"Conectando a {FTP_HOST}...")
    try:
        ftp = ftplib.FTP(FTP_HOST, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ Conectado!")
        
        # Listar diretório atual
        print("\nDiretório atual:")
        ftp.pwd()
        
        # Navegar para public_html
        try:
            ftp.cwd(FTP_PATH)
            print(f"\nConteúdo de {FTP_PATH}:")
            files = ftp.nlst()
            for f in files[:10]:
                print(f"  - {f}")
            if len(files) > 10:
                print(f"  ... e mais {len(files) - 10} arquivos")
        except Exception as e:
            print(f"Erro ao navegar: {e}")
        
        ftp.quit()
        print("\n✅ Conexão fechada")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())