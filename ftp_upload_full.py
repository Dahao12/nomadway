#!/usr/bin/env python3
"""
Upload do site NomadWay para Hostinger FTP
"""
import ftplib
import os
import sys

# Configurações
FTP_HOST = "185.245.180.59"
FTP_USER = "u608840078"
FTP_PASS = "5676484aS@@"
LOCAL_PATH = "out"

# Arquivos/pastas para deletar antes do upload
TO_DELETE = [
    "index.html",
    "index-remote.html",
    "index-remote.html.bak",
    "agendamento.html",
    "agendar.html",
    "booking.html",
    "agendamento-html.tar.gz",
    "_next",
    "pt",
    "en",
    "404",
]

def upload_file(ftp, local_path, remote_path):
    """Upload um arquivo"""
    try:
        with open(local_path, 'rb') as f:
            ftp.storbinary(f'STOR {remote_path}', f)
        return True
    except Exception as e:
        print(f"  ❌ Erro no arquivo {remote_path}: {e}")
        return False

def upload_directory(ftp, local_dir, remote_dir=""):
    """Upload recursivo de diretório"""
    success = 0
    failed = 0
    
    for item in sorted(os.listdir(local_dir)):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}" if remote_dir else item
        
        if os.path.isfile(local_path):
            print(f"  📤 {remote_path}")
            if upload_file(ftp, local_path, remote_path):
                success += 1
            else:
                failed += 1
        elif os.path.isdir(local_path):
            # Criar diretório
            try:
                ftp.mkd(remote_path)
                print(f"  📁 {remote_path}/ (criado)")
            except ftplib.error_perm:
                pass  # Diretório já existe
            
            # Upload do conteúdo
            s, f = upload_directory(ftp, local_path, remote_path)
            success += s
            failed += f
    
    return success, failed

def main():
    print("=" * 50)
    print("🚀 UPLOAD NOMADWAY SITE")
    print("=" * 50)
    
    # Verificar pasta local
    if not os.path.exists(LOCAL_PATH):
        print(f"❌ Pasta '{LOCAL_PATH}' não encontrada!")
        return 1
    
    # Conectar
    print(f"\n🔌 Conectando a {FTP_HOST}...")
    try:
        ftp = ftplib.FTP(FTP_HOST, timeout=60)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ Conectado!")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return 1
    
    # Deletar arquivos antigos
    print("\n🗑️ Limpando arquivos antigos...")
    for item in TO_DELETE:
        try:
            try:
                ftp.rmd(item)  # Tenta remover como diretório
                print(f"  🗑️ {item}/ (diretório)")
            except:
                try:
                    ftp.delete(item)  # Tenta remover como arquivo
                    print(f"  🗑️ {item}")
                except:
                    pass  # Arquivo não existe
        except:
            pass
    
    # Upload
    print(f"\n📤 Fazendo upload de '{LOCAL_PATH}'...")
    success, failed = upload_directory(ftp, LOCAL_PATH)
    
    ftp.quit()
    
    # Resumo
    print("\n" + "=" * 50)
    print("📊 RESUMO")
    print("=" * 50)
    print(f"✅ Sucesso: {success}")
    print(f"❌ Falhas: {failed}")
    print("\n🎉 Upload concluído!")
    print("🌐 Acesse: https://nomadway.com.br")
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())