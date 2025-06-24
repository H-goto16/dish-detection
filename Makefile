.PHONY:  setup backend frontend dev clean server setup-parallel setup-venv test test-backend test-frontend train-model view-training-stats clean-training-data

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

train-model:
	@echo "Starting model fine-tuning..."
	curl -X POST "http://localhost:8000/training/start" \
	  -H "accept: application/json" \
	  -H "Content-Type: application/json"

view-training-stats:
	@echo "Fetching training data statistics..."
	curl -X GET "http://localhost:8000/training/data/stats" \
	  -H "accept: application/json" | python3 -m json.tool

clean-training-data:
	@echo "Cleaning training data directory..."
	cd backend/src && rm -rf training_data/
	@echo "Training data cleared."

venv-clean:
	rm -rf backend/.venv

stop:
	pkill -f "uvicorn main:app --reload --host 0.0.0.0 --port 8000"
	pkill -f "pnpm run start"
