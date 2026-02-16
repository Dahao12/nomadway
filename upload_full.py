#!/usr/bin/env python3
"""
Upload completo - Deleta arquivos antigos e envia novos
"""
import ftplib
import os
import sys

FTP_HOST = "185.245.180.59"
FTP_USER = "u608840078"
FTP_PASS = "5676484aS@@"
LOCAL_PATH = "/Users/clowd/.openclaw/workspace/nomadway-site/out"

def delete_recursive(ftp, path):
    """Deleta arquivos e pastas recursivamente"""
    try:
        files = ftp.nlst(path)
        for f in files:
            if f == '.' or f == '..' or f == path:
                continue
            try:
                ftp.cwd(f)
                ftp.cwd('..')
                # É diretório
                delete_recursive(ftp, f)
                try:
                    ftp.rmd(f)
                    print(f"  🗑️ {f}/")
                except:
                    pass
            except:
                # É arquivo
                try:
                    ftp.delete(f)
                    print(f"  🗑️ {f}")
                except:
                    pass
    except:
        pass

def main():
    print("=" * 50)
    print("🗑️ LIMPANDO ARQUIVOS ANTIGOS")
    print("=" * 50)
    
    ftp = ftplib.FTP(FTP_HOST, timeout=60)
    ftp.login(FTP_USER, FTP_PASS)
    print("✅ Conectado!")
    
    # Arquivos/pastas para deletar
    to_delete = ['index.html', 'index-remote.html', 'agendamento.html', 
                 'agendar.html', 'booking.html', '404.html', 
                 '_next', 'pt', 'en', '404']
    
    for item in to_delete:
        try:
            try:
                ftp.delete(item)
                print(f"  🗑️ {item}")
            except:
                try:
                    ftp.rmd(item)
                    print(f"  🗑️ {item}/")
                except:
                    pass
        except:
            pass
    
    ftp.quit()
    print("\n✅ Limpeza concluída!")
    
    print("\n" + "=" * 50)
    print("📤 ENVIANDO NOVOS ARQUIVOS")
    print("=" * 50)
    
    # Reconectar para upload
    ftp = ftplib.FTP(FTP_HOST, timeout=60)
    ftp.login(FTP_USER, FTP_PASS)
    
    success = 0
    failed = 0
    
    # Upload arquivos raiz
    print("\n📤 Arquivos raiz...")
    for item in os.listdir(LOCAL_PATH):
        local_path = os.path.join(LOCAL_PATH, item)
        if os.path.isfile(local_path):
            try:
                with open(local_path, 'rb') as f:
                    ftp.storbinary(f'STOR {item}', f)
                print(f"  ✅ {item}")
                success += 1
            except Exception as e:
                print(f"  ❌ {item}: {e}")
                failed += 1
    
    # Upload pt/
    print("\n📤 pt/...")
    try:
        ftp.mkd('pt')
    except:
        pass
    pt_path = os.path.join(LOCAL_PATH, 'pt')
    for item in os.listdir(pt_path):
        local_file = os.path.join(pt_path, item)
        if os.path.isfile(local_file):
            try:
                with open(local_file, 'rb') as f:
                    ftp.storbinary(f'STOR pt/{item}', f)
                print(f"  ✅ pt/{item}")
                success += 1
            except Exception as e:
                print(f"  ❌ pt/{item}: {e}")
                failed += 1
    
    # Upload en/
    print("\n📤 en/...")
    try:
        ftp.mkd('en')
    except:
        pass
    en_path = os.path.join(LOCAL_PATH, 'en')
    for item in os.listdir(en_path):
        local_file = os.path.join(en_path, item)
        if os.path.isfile(local_file):
            try:
                with open(local_file, 'rb') as f:
                    ftp.storbinary(f'STOR en/{item}', f)
                print(f"  ✅ en/{item}")
                success += 1
            except Exception as e:
                print(f"  ❌ en/{item}: {e}")
                failed += 1
    
    # Upload _next/static/
    print("\n📤 _next/static/...")
    next_path = os.path.join(LOCAL_PATH, '_next')
    try:
        ftp.mkd('_next')
    except:
        pass
    try:
        ftp.mkd('_next/static')
    except:
        pass
    
    static_path = os.path.join(next_path, 'static')
    for folder in ['css', 'chunks', 'media']:
        folder_path = os.path.join(static_path, folder)
        if os.path.exists(folder_path):
            try:
                ftp.mkd(f'_next/static/{folder}')
            except:
                pass
            for f in os.listdir(folder_path)[:20]:  # Primeiros 20 de cada
                local_file = os.path.join(folder_path, f)
                if os.path.isfile(local_file):
                    try:
                        with open(local_file, 'rb') as fp:
                            ftp.storbinary(f'STOR _next/static/{folder}/{f}', fp)
                        success += 1
                    except:
                        failed += 1
            print(f"  ✅ _next/static/{folder}/")
    
    ftp.quit()
    
    print("\n" + "=" * 50)
    print("📊 RESUMO")
    print("=" * 50)
    print(f"✅ Sucesso: {success}")
    print(f"❌ Falhas: {failed}")
    print("\n🌐 Teste: https://nomadway.com.br")

if __name__ == "__main__":
    main()