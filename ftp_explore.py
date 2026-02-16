#!/usr/bin/env python3
import ftplib
import sys

FTP_HOST = "185.245.180.59"
FTP_USER = "u608840078"
FTP_PASS = "5676484aS@@"

def main():
    print(f"Conectando a {FTP_HOST}...")
    ftp = ftplib.FTP(FTP_HOST, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    print("✅ Conectado!\n")
    
    print("Diretório atual:")
    print(f"  {ftp.pwd()}\n")
    
    print("Conteúdo do diretório raiz:")
    files = ftp.nlst()
    for f in files:
        try:
            ftp.cwd(f)
            ftp.cwd("..")
            print(f"  📁 {f}/")
        except:
            print(f"  📄 {f}")
    
    # Tentar caminhos comuns da Hostinger
    paths_to_try = [
        "public_html",
        "domains/nomadway.com.br/public_html",
        "www",
        "htdocs",
        "nomadway.com.br",
    ]
    
    print("\n\nProcurando public_html...")
    for path in paths_to_try:
        try:
            ftp.cwd(path)
            print(f"  ✅ Encontrado: {path}")
            ftp.cwd("/")
        except:
            pass
    
    # Listar subdiretórios
    print("\n\nListando domains/ (se existir):")
    try:
        ftp.cwd("domains")
        for d in ftp.nlst():
            print(f"  📁 domains/{d}/")
            try:
                ftp.cwd(d)
                for sub in ftp.nlst():
                    print(f"      📁 {sub}/")
                ftp.cwd("/domains")
            except:
                pass
    except:
        print("  (não existe)")
    
    ftp.quit()
    print("\n✅ Conexão fechada")

if __name__ == "__main__":
    main()