#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

fn setup() -> (Env, PulsoIncidentsClient<'static>, BytesN<32>, BytesN<32>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(PulsoIncidents, ());
    let client = PulsoIncidentsClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    let case = BytesN::from_array(&env, &[1u8; 32]);
    let commit = BytesN::from_array(&env, &[9u8; 32]);
    (env, client, case, commit)
}

#[test]
fn full_lifecycle() {
    let (_env, client, case, commit) = setup();
    client.record_event(&case, &1, &OPENED, &1000, &commit);
    client.record_event(&case, &2, &FAMILY_ACK, &1001, &commit);
    let (seq, closed) = client.get_case_state(&case);
    assert_eq!(seq, 2);
    assert!(!closed);
    client.record_event(&case, &3, &CLOSED, &1002, &commit);
    let (seq, closed) = client.get_case_state(&case);
    assert_eq!(seq, 3);
    assert!(closed);
}

#[test]
fn cannot_initialize_twice() {
    let (_env, client, _case, _commit) = setup();
    let admin2 = Address::generate(&_env);
    assert!(client.try_initialize(&admin2).is_err());
}

#[test]
fn opened_must_be_first() {
    let (_env, client, case, commit) = setup();
    // Abrir con seq != 1 debe fallar.
    assert!(client.try_record_event(&case, &2, &OPENED, &1000, &commit).is_err());
}

#[test]
fn rejects_bad_sequence() {
    let (_env, client, case, commit) = setup();
    client.record_event(&case, &1, &OPENED, &1000, &commit);
    // Saltar de 1 a 3 debe fallar.
    assert!(client.try_record_event(&case, &3, &FAMILY_ACK, &1001, &commit).is_err());
}

#[test]
fn rejects_events_after_close() {
    let (_env, client, case, commit) = setup();
    client.record_event(&case, &1, &OPENED, &1000, &commit);
    client.record_event(&case, &2, &CLOSED, &1001, &commit);
    // Un caso cerrado no acepta más eventos.
    assert!(client.try_record_event(&case, &3, &FAMILY_ACK, &1002, &commit).is_err());
}

#[test]
fn rejects_invalid_event_code() {
    let (_env, client, case, commit) = setup();
    assert!(client.try_record_event(&case, &1, &99, &1000, &commit).is_err());
}

#[test]
fn rejects_zero_timestamp() {
    let (_env, client, case, commit) = setup();
    assert!(client.try_record_event(&case, &1, &OPENED, &0, &commit).is_err());
}

#[test]
fn unknown_case_returns_zero() {
    let (env, client, _case, _commit) = setup();
    let other = BytesN::from_array(&env, &[7u8; 32]);
    let (seq, closed) = client.get_case_state(&other);
    assert_eq!(seq, 0);
    assert!(!closed);
}
