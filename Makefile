.PHONY:  setup backend frontend dev clean server setup-parallel setup-venv test test-backend test-frontend

PYTHON_COMMAND=python3
PIP_COMMAND=pip3
PNPM_COMMAND=pnpm

setup:
	aqua i
	make setup-parallel
	make setup-venv

setup-parallel:
	cd frontend && ${PNPM_COMMAND} install &
	cd backend && ${PYTHON_COMMAND} -m venv .venv &
	wait

setup-venv:
	cd backend && . .venv/bin/activate && ${PYTHON_COMMAND} -m pip install -r requirements.txt

server:
	cd backend/src && . ../.venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && ${PNPM_COMMAND} run start

dev:
	make server & make frontend

test:
	make test-backend & make test-frontend

test-backend:
	cd backend && . .venv/bin/activate && pytest

test-frontend:
	cd frontend && ${PNPM_COMMAND} test

venv-clean:
	rm -rf backend/.venv

stop:
	pkill -f "uvicorn main:app --reload --host 0.0.0.0 --port 8000"
	pkill -f "pnpm run start"
