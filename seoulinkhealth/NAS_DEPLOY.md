Synology NAS 배포 가이드


[준비물]

1. Synology NAS (Container Manager / Docker 설치됨)
2. NAS에 SSH 접속 또는 File Station 사용 가능
3. Gmail 앱 비밀번호 (SMTP용)


[1단계 : 프로젝트 파일을 NAS로 복사]

seoulinkhealth 폴더 전체를 NAS의 공유 폴더로 복사합니다.

방법 A - File Station:
  NAS File Station 열기 -> docker 폴더 안에 seoulinkhealth 폴더 업로드

방법 B - SSH:
  scp -r seoulinkhealth/ 사용자@NAS주소:/volume1/docker/seoulinkhealth


[2단계 : docker-compose.yml 설정 수정]

NAS에 복사된 docker-compose.yml 파일을 열어서 아래 값들을 실제 값으로 변경합니다.

SMTP_USER=본인이메일@gmail.com       -> 실제 Gmail 주소
SMTP_PASS=16자리앱비밀번호            -> Gmail 앱 비밀번호
JWT_SECRET=여기에-긴-랜덤-문자열      -> 아무 긴 문자열 (예: mySecretKey123!@#abcdef)
ADMIN_PASSWORD=관리자비밀번호         -> 관리자 로그인 비밀번호

포트를 바꾸고 싶으면:
  ports 항목의 8080을 원하는 포트로 변경 (예: 9090:3001)


[3단계 : Container Manager에서 빌드 및 실행]

방법 A - Container Manager UI (권장):

1. Synology DSM 접속
2. Container Manager 앱 열기
3. 왼쪽 메뉴 "프로젝트" 클릭
4. "만들기" 버튼 클릭
5. 프로젝트 이름: seoulinkhealth
6. 경로: /volume1/docker/seoulinkhealth 선택
7. docker-compose.yml 이 자동으로 인식됨
8. "빌드 및 시작" 클릭
9. 빌드에 2-3분 정도 소요됩니다

방법 B - SSH:

NAS에 SSH 접속 후:
  cd /volume1/docker/seoulinkhealth
  sudo docker-compose up -d --build


[4단계 : 접속 확인]

브라우저에서 아래 주소로 접속합니다:

  http://NAS주소:8080

예시: http://192.168.0.100:8080

메인 페이지가 뜨면 성공입니다.

관리자 접속: http://NAS주소:8080/login
회사 로그인: http://NAS주소:8080/company/login


[5단계 : 외부 접속 설정 (선택)]

NAS를 인터넷에서 접속하려면:

1. Synology DDNS 설정:
   DSM -> 제어판 -> 외부 액세스 -> DDNS
   호스트명 등록 (예: seoulinkhealth.synology.me)

2. 포트 포워딩:
   공유기 설정에서 외부포트 80 또는 443 -> NAS내부 8080 포트 포워딩

3. 역방향 프록시 (HTTPS):
   DSM -> 제어판 -> 로그인 포털 -> 고급 -> 역방향 프록시
   새로 추가:
     설명: SEOULINKHEALTH
     소스: HTTPS, 호스트명 seoulinkhealth.synology.me, 포트 443
     대상: HTTP, localhost, 포트 8080

4. 인증서 (Let's Encrypt):
   DSM -> 제어판 -> 보안 -> 인증서
   추가 -> Let's Encrypt 인증서 받기
   도메인: seoulinkhealth.synology.me

이렇게 하면 https://seoulinkhealth.synology.me 로 외부에서 접속 가능합니다.


[자체 도메인 연결 (선택)]

seoulinkhealth.com 도메인을 사용하려면:

1. 도메인 DNS 설정에서 A 레코드를 NAS의 외부 IP로 지정
   또는 CNAME을 seoulinkhealth.synology.me로 지정

2. docker-compose.yml의 CORS_ORIGINS에 도메인 추가:
   CORS_ORIGINS=https://seoulinkhealth.com,https://www.seoulinkhealth.com

3. 역방향 프록시에 seoulinkhealth.com 추가

4. Let's Encrypt 인증서에 seoulinkhealth.com 추가


[문제 해결]

빌드 실패시:
  Container Manager -> 해당 프로젝트 -> 로그 확인
  또는 SSH에서: sudo docker-compose logs

포트 충돌시:
  docker-compose.yml에서 8080을 다른 포트로 변경

DB 초기화 하고 싶을 때:
  data 폴더의 seoulinkhealth.db 파일 삭제 후 컨테이너 재시작

컨테이너 재시작:
  Container Manager에서 해당 프로젝트 정지 -> 시작
  또는 SSH: sudo docker-compose restart

로그 확인:
  SSH: sudo docker-compose logs -f
