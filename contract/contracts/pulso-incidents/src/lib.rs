#![no_std]
//! Pulso — anclaje de eventos de incidentes en Stellar (Soroban).
//!
//! Deja una constancia verificable de la secuencia de cada incidente
//! (OPENED -> FAMILY_ACK -> CLOSED/FALSE_ALARM) mediante un `commitment`
//! (hash del registro privado + nonce). NO recibe datos personales ni clínicos:
//! `case_key` es un identificador aleatorio y `commitment` es un hash opaco.
//! Ver docs/PULSO_MASTER_SPEC.md §6.6.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
};

/// Códigos de evento (enum corto).
pub const OPENED: u32 = 1;
pub const FAMILY_ACK: u32 = 2;
pub const CLOSED: u32 = 3;
pub const FALSE_ALARM: u32 = 4;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    CaseClosed = 3,
    BadSequence = 4,
    OpenedMustBeFirst = 5,
    InvalidEventCode = 6,
    InvalidTimestamp = 7,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Case(BytesN<32>),
}

/// Estado mínimo por incidente (para impedir repeticiones y reordenamientos).
#[contracttype]
#[derive(Clone)]
pub struct CaseState {
    pub last_seq: u32,
    pub closed: bool,
}

#[contract]
pub struct PulsoIncidents;

#[contractimpl]
impl PulsoIncidents {
    /// Configura la cuenta de servicio autorizada (una sola vez).
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Ancla un evento del incidente. Solo la cuenta de servicio puede escribir.
    /// Reglas: `seq = last_seq + 1`; `OPENED` requiere `seq == 1`; un caso cerrado
    /// no acepta más eventos; `CLOSED`/`FALSE_ALARM` cierran el caso.
    pub fn record_event(
        env: Env,
        case_key: BytesN<32>,
        seq: u32,
        event_code: u32,
        server_received_at_unix: u64,
        commitment: BytesN<32>,
    ) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if event_code < OPENED || event_code > FALSE_ALARM {
            return Err(Error::InvalidEventCode);
        }
        if server_received_at_unix == 0 {
            return Err(Error::InvalidTimestamp);
        }

        let key = DataKey::Case(case_key.clone());
        let mut state: CaseState = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(CaseState { last_seq: 0, closed: false });

        if state.closed {
            return Err(Error::CaseClosed);
        }
        if event_code == OPENED {
            if seq != 1 || state.last_seq != 0 {
                return Err(Error::OpenedMustBeFirst);
            }
        } else if seq != state.last_seq + 1 {
            return Err(Error::BadSequence);
        }

        state.last_seq = seq;
        if event_code == CLOSED || event_code == FALSE_ALARM {
            state.closed = true;
        }
        env.storage().persistent().set(&key, &state);

        // Evento público verificable en el explorador (sin datos personales).
        env.events().publish(
            (symbol_short!("pulso"), case_key),
            (seq, event_code, server_received_at_unix, commitment),
        );
        Ok(())
    }

    /// Estado de un incidente: (último seq, cerrado). (0, false) si no existe.
    pub fn get_case_state(env: Env, case_key: BytesN<32>) -> (u32, bool) {
        let state: CaseState = env
            .storage()
            .persistent()
            .get(&DataKey::Case(case_key))
            .unwrap_or(CaseState { last_seq: 0, closed: false });
        (state.last_seq, state.closed)
    }
}

mod test;
