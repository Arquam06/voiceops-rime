import asyncio
import time
from typing import Dict, Any
from app.models.schemas import TaskResultResponse

class OperationalTaskService:
    def __init__(self):
        self.active_tasks: Dict[str, str] = {}  # request_id -> status

    async def execute_task(self, task_id: str, delay_seconds: float, request_id: str) -> TaskResultResponse:
        """
        Executes a simulated operational task with controlled delay.
        Returns detailed status payload and spoken summary text.
        """
        start_time = time.time()
        self.active_tasks[request_id] = "RUNNING"

        # Simulate operational processing delay (non-blocking async sleep)
        await asyncio.sleep(delay_seconds)

        elapsed_ms = (time.time() - start_time) * 1000

        # Construct specific operational response based on task_id
        if task_id in ["deployment", "task-101"]:
            summary_text = "Kubernetes deployment check completed. Cluster us-east-1 has 24 active pods. All deployments running healthy on v2.4.1."
            speech_text = "Deployment check complete. All 24 pods in cluster U S East 1 are healthy and running version 2.4.1."
            details = {"cluster": "us-east-1", "pods_healthy": 24, "version": "v2.4.1", "status": "HEALTHY"}

        elif task_id in ["database", "task-102"]:
            summary_text = "PostgreSQL replica audit completed. Primary database load 18%. Replica lag is 12 milliseconds across all nodes."
            speech_text = "Database check complete. PostgreSQL replica lag is 12 milliseconds. Primary database load is normal at 18 percent."
            details = {"replica_lag_ms": 12, "primary_load_pct": 18, "active_connections": 142, "status": "HEALTHY"}

        elif task_id in ["microservice", "task-103"]:
            summary_text = "Microservice latency scan completed. API Gateway p99 response time is 24ms. Auth token service operating normally."
            speech_text = "Microservice health check complete. API Gateway p 99 latency is 24 milliseconds with 100 percent uptime."
            details = {"gateway_p99_ms": 24, "auth_uptime_pct": 100.0, "status": "HEALTHY"}

        elif task_id in ["incident", "task-104"]:
            summary_text = "Incident INC-8921 status retrieved. Memory utilization on worker-node-04 peaked at 92%. Auto-scaler added 2 instances."
            speech_text = "Incident status update. Incident 8921 memory spike resolved. Auto scaler successfully provisioned 2 additional worker nodes."
            details = {"incident_id": "INC-8921", "peak_memory_pct": 92, "action_taken": "auto-scaled", "status": "MITIGATED"}

        else:
            summary_text = f"Operational query for {task_id} completed successfully."
            speech_text = f"Operational check for {task_id} completed successfully."
            details = {"query": task_id, "status": "OK"}

        return TaskResultResponse(
            task_id=task_id,
            request_id=request_id,
            status="COMPLETED",
            summary_text=summary_text,
            speech_text=speech_text,
            execution_time_ms=round(elapsed_ms, 2),
            is_stale=False,
            details=details
        )

task_service = OperationalTaskService()
