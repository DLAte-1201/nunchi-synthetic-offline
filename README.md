# Nunchi — 합성 오프라인 예제

허용 입력 필드 투영, 직렬 모의 요청의 예약·정산·미확정 중단, 사람 평가가 입력되지 않은 비교 카드의 생성을 보여줍니다. 비용은 가상 정수 단위이며 실제 가격이나 토큰이 아닙니다.

## 실행

Node.js 24.16.0 이상에서 패키지 디렉터리 안의 다음 명령을 사용합니다. npm 설치·외부 네트워크·API 키·유료 호출·추가 다운로드가 필요하지 않습니다.

    node demo.mjs
    node --test test/contracts.test.mjs

데모는 합성 JSON을 stdout에 출력합니다. SQLite는 메모리에서만 사용합니다. Seed Vault에서는 SQLite 실험 기능 경고가 나올 수 있습니다.

## 합성 기대값

```json
{
  "requests": 4,
  "exposure_units": 14,
  "ratings.cards.length": 2,
  "ratings.human_ratings_created": 0,
  "model_calls": 0
}
```

## 공개 검토 범위

이 변형본에는 새로 작성한 합성 Node 예제·기계적 동작 테스트·합성 fixture·설명만 포함됩니다. 원본 참조 소스, 원래 연구 문항·결과·평가자 자료, 승인 증빙, 개인 대화, 운영 주소, 운영 DB, 인증 자료는 포함하지 않습니다. 실제 연구 실행기나 원래 프로젝트 전체를 재현한 것으로 해석하면 안 됩니다.

테스트는 명시된 기계적 동작만 확인합니다. 연구 성능·가설·라벨의 의미적 타당성·사람 평가·실제 토큰이나 청구·운영 인증을 검증하지 않습니다. 클라우드 실행과 원래 연구 실행기의 재현은 NOT_RUN입니다.

## 권리 및 배포 판단

사용자가 이 합성 패키지를 승인된 새 public GitHub 저장소에 게시하도록 요청했습니다. 이 패키지의 코드·설명·새 합성 예제는 사용자 선택에 따라 MIT 라이선스를 적용합니다. Copyright (c) 2026 서경민. 전체 조건은 LICENSE를 확인하세요. 승인된 새 public 저장소 목적지는 DLAte-1201/nunchi-synthetic-offline입니다. 실제 원격 게시·커밋·가시성은 별도 배포 결과로 확인해야 합니다. package.json의 private 플래그는 npm 게시를 막는 설정이며 GitHub 공개 여부를 뜻하지 않습니다.

RELEASE-SCOPE.json, REPRODUCTION-STATUS.json, PUBLIC-MANIFEST.json, RIGHTS.md를 함께 확인하세요. 이 예제의 검증은 민감정보 부재의 전체 인증이나 공개 가능성 보장이 아닙니다.

## 감사 후 수정 상태 (v0.1.1)

예약 후 응답 검증에서 예외가 발생해도 예약을 미확정으로 유지하고 halted=true로 중단합니다. 예외를 잡은 호출자도 다음 요청/카드 내보내기를 진행할 수 없습니다. 비교 카드의 각 쌍은 context와 전체 messages 입력이 같아야 하며 객체 키 순서 차이는 허용합니다.

과거 후보에 대한 독립감사 23/23 회귀·26/26 데모·92 manifest 일치 결과는 사용자 전달 사항입니다. 독립감사 원문 파일은 이 실행환경에 미제출이며 새 수정 후보에 대한 독립감사 완료를 뜻하지 않습니다. 새로운 최종 배포 ZIP 검증은 별도 FINAL-ZIP-VERIFICATION.json에서 정확한 ZIP 해시와 함께 확인해야 합니다.
