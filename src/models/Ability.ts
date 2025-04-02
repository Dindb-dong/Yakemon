type appearanceAbility = 'rank_change' | // 등장 시 또는 특정 조건 달성 시 랭크 상태 변화, 1회성 (예: 불요의검, 감미로운꿀, 위협, 고대활성, 기묘한약, 다운로드 등)
  'field_change' | // 필드 바꾸는 특성 (예: 일렉트릭메이커, 그래스메이커, 사이코메이커, 미스트메이커 등)
  'aura_change' | // 오라 적용 (예: 다크오라, 페어리오라 등)
  'weather_change' | // 날씨 변화 (예: 가뭄, 잔비, 끝의대지, 눈퍼뜨리기, 델타스트림, 모래날림 등)
  'heal' | // 회복시키는 특성 (예: 대접 등)
  'ability_change' | // 특성 변화 (예: 리시버, 트레이스 등)
  'disaster' | // 재앙 특성들 (예: 재앙의구슬, 재앙의그릇 등)
  'form_change'; // 등장 시 변화 (예: 괴짜, 기분파, 일루전 등)

type offensive_BeforeAbility =
  // 아래는 데미지 계산 전 발동하는 특성
  'damage_buff' | // 특정 조건에서 기술 위력 증가 (예: 철주먹, 단단한발톱, 적응력, 테크니션, 
  // 심록, 급류, 맹화, 벌레의알림, 강철술사, 강철정신, 스나이퍼, 근성, 메가런처, 적응력, 모래의힘 등)
  'demerit' | // 특정 조건에서 능력치 감소 또는 디메리트 (예: 무기력)
  'ability_nullification' | // 특성 무효화 (예: 틀깨기, 터보블레이즈, 테라볼티지, 균사의힘 등)
  'type_nullification' | // 방어 상성 무효화 (예: 배짱, 심안 등)
  'type_change' | // 사용하는 기술 타입이나 본인 타입 변화 (예: 노말스킨, 스카이스킨, 리베로, 변환자재 등 ) -> updatePokemon 함수 호출하자. 
  'rank_buff' | // 랭크 버프 특성, 랭크업과 별도로 중첩 가능 (예: 선파워, 독폭주, 열폭주, 마이너스, 플러스 등)
  'crack'; // 상대의 어떠한 것을 무시 (예: 보이지않는주먹, 틈새포착 등) -> updateEnv 쓰기. 

type offensive_AfterAbility =
  // 아래는 데미지 계산 후 발동하는 특성
  'status_change' | // 상태이상 부여 (예: 독사슬, 독수, 악취, 독조종 등)
  'rank_change' | // 랭크 변화 (예: 자기과신 등 )
  'remove_demerit' | // 디메리트 삭제 (예: 돌머리 등)
  'item'; // 아이템 관련 (예: 나쁜손버릇, 매지션)

type defensive_BeforeAbility =
  // 데미지 계산 전 발동하는 특성
  'type_nullification' | // 타입 상성 무효화 (예: 부유, 저수, 흙먹기, 초식, 건조피부, 노릇노릇바디, 마중물, 타오르는불꽃, 피뢰침, 전기엔진)
  'damage_nullification' | // 데미지 무효화 (예: 방탄, 방진 등)
  'damage_reduction' | // 데미지 감소 (예: 퍼코트, 복슬복슬, 필터, 하드록, 두꺼운지방, 내열, 수포, 멀티스케일, 스펙터가드 등 )
  'critical_nullification'; // 급소 무효화 (예: 조가비갑옷, 전투무장 등)

type defensive_AfterAbility =
  // 데미지 계산 후 발동하는 특성
  'status_change' | // 상태이상 부여 (예: 독가시, 불꽃몸, 정전기 등)
  'damade_reflection' | // 데미지 반사 (예: 철가시, 까칠한피부, 내용물분출 등)
  'rank_change' | // 랭크 상태 변화 (예: 지구력, 꾸덕꾸덕굳기, 발끈, 깨어진갑옷, 노릇노릇바디 등)
  'ability_change' | // 특성을 바꾸는 특성 (예: 미라, 가시지않는향기, 떠도는영혼 등)
  'heal' | // 체력을 절대적 비율로 회복하는 특성 (예: 건조피부 등)
  'weather_change' | // 공격받으면 날씨 바꾸는 특성 (예: 모래뿜기 등)
  'field_change'; // 공격받으면 필드 바꾸는 특성 (예: 넘치는씨 등)

type utilAbility =
  'hp_low_trigger' | // 특정 체력 이하일 때 발동 (예: 긴급회피, 도망태세, 먹보 등)
  'change_trigger' | // 교체하면 발동 (예: 재생력, 마이티체인지 등)
  'rank_nullification' | // 랭크 무효화 (예: 천진, 괴력집게, 날카로운눈, 메탈프로텍트 등)
  'rank_buff' | // 랭크 버프 특성, 랭크업과 중첩 가능, 스피드나 명중률이나 회피율 등 (예: 모래헤치기, 복안, 갈지자걸음, 
  // 곡예, 모래숨기, 눈숨기, 눈치우기, 대운, 엽록소 등)
  'rank_change' | // 랭크 상태 변화 (예: 가속, 변덕쟁이, 단순 등)
  'type_change' | // 타입 변화 (예: AR시스템, 멀티타입 등)
  'form_change' | // 폼체인지 등 (예: 배틀체인지, 꼬르륵스위치, 달마모드, 리밋실드 등)
  'tickDamage_nullification' | // 틱뎀 무효화, 기술 데미지만 받음 (예: 매직가드)
  'statusMove_nullification' | // 변화기술 반사 (예: 매직코트)
  'status_nullification' | // 상태이상 무효화 (예: 수의베일, 유연, 둔감, 리프가드, 마그마의무장, 마이페이스, 면역 등)
  'ability_nullification' | // 특성 무효화 (예: 화학변화가스 등)
  'weather_nullification' | // 날씨 없는 것 취급! 단, 턴 수 남아있을 때 교체하면 날씨 다시 적용 (예: 날씨부정 등)
  'intimidate_nullification' | // 위협 무시 특성 (예: 둔감, 마이페이스, 정신력, 배짱, 주눅, 파수견 등)
  'heal' | // 회복 특성 (예: 포이즌힐, 젖은접시, 건조피부 등)
  'damage' | // 데미지 주는 특성 (예: 나이트메어 등)
  'restrict_enemy' | // 상대를 제한하는 특성 (예: 개미지옥, 그림자밟기, 긴장감 등)
  'certainly' | // 반드시 ~~하는 특성 (예: 노가드, 무모한행동, 불가사의부적 등 )
  'demerit' | // 디메리트 특성. (예: 슬로스타트, 게으름 등)
  'etc'; // 짬통 (예: 멸망의바디)

export type AbilityInfo = {
  id: number;
  name: string;

  // 등장 시 발동하는 특성
  appear?: appearanceAbility[];

  // 공격적인 특성 (꼭 공격할때만 발동하는건 아님.)
  offensive?: offensive_BeforeAbility[] | offensive_AfterAbility[];

  // 방어적 특성 (꼭 데미지 받을때만 발동하는건 아님. 예: 부유)
  defensive?: defensive_AfterAbility[] | defensive_BeforeAbility[]

  // 유틸리티 특성, 매 턴 새롭게 발생시키면 유지하는 효과도 구현 가능한가?
  util?: utilAbility[];

  unTouchable?: boolean; // 무시될 수 없는 특성. 멀티타입, 메탈프로텍트 등 
}