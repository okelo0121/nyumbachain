WASM_TARGET = target/wasm32-unknown-unknown/release/nyumbachain_escrow.wasm
OPTIMIZED   = target/nyumbachain_escrow.optimized.wasm
NETWORK     ?= testnet

.PHONY: build optimize test clean deploy

build:
	cargo build --target wasm32-unknown-unknown --release

optimize: build
	stellar contract optimize --wasm $(WASM_TARGET) --wasm-out $(OPTIMIZED)

test:
	cargo test

clean:
	cargo clean

deploy: optimize
	stellar contract deploy \
		--wasm $(OPTIMIZED) \
		--network $(NETWORK) \
		--source service-keypair
